import { spawnSync, SpawnSyncReturns } from 'child_process';
import { writeFileSync } from 'fs';
import {
  CloudWatchLogsClient,
  CreateLogStreamCommand,
  PutLogEventsCommand,
  PutLogEventsCommandInput,
  ResourceAlreadyExistsException,
} from '@aws-sdk/client-cloudwatch-logs';
import {
  CloudFormationClient,
  DescribeStacksCommand,
  ResourceStatus,
} from '@aws-sdk/client-cloudformation';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CdkCustomResourceHandler, CdkCustomResourceResponse } from 'aws-lambda';
import { ScannerCustomResourceProps } from '../../src/custom-resource-props';
import {
  ScanLogsOutputOptions,
  ScanLogsOutputType,
  CloudWatchLogsOutputOptions,
  S3OutputOptions,
} from '../../src/scan-logs-output';

const TRIVY_IGNORE_FILE_PATH = '/tmp/.trivyignore';
const TRIVY_IGNORE_YAML_FILE_PATH = '/tmp/.trivyignore.yaml';

const cwClient = new CloudWatchLogsClient();
const cfnClient = new CloudFormationClient();
const snsClient = new SNSClient();
const s3Client = new S3Client();

export const handler: CdkCustomResourceHandler = async function (event) {
  const requestType = event.RequestType;
  const props = event.ResourceProperties as unknown as ScannerCustomResourceProps;

  if (!props.addr || !props.imageUri) throw new Error('addr and imageUri are required.');

  const funcResponse: CdkCustomResourceResponse = {
    PhysicalResourceId: props.addr,
    Data: {} as { [key: string]: string },
  };

  if (requestType !== 'Create' && requestType !== 'Update') {
    return funcResponse;
  }

  const options = makeOptions(props);

  if (props.trivyIgnore.length) {
    console.log('trivyignore: ' + JSON.stringify(props.trivyIgnore));
    makeTrivyIgnoreFile(props.trivyIgnore, props.trivyIgnoreFileType);
  }

  const cmd = `/opt/trivy image --no-progress ${options.join(' ')} ${props.imageUri}`;
  console.log('command: ' + cmd);
  console.log('imageUri: ' + props.imageUri);

  const response = spawnSync(cmd, {
    shell: true,
  });

  await outputScanLogs(response, props.imageUri, props.output);

  if (response.status === 0) {
    return funcResponse;
  }

  const status =
    response.status === 1
      ? 'vulnerabilities or end-of-life (EOL) image detected'
      : `unexpected exit code ${response.status}`;
  const errorMessage = `Error: ${response.error}\nSignal: ${response.signal}\nStatus: ${status}\nImage Scanner returned fatal errors. You may have vulnerabilities. See logs.`;

  if (props.vulnsTopicArn) {
    await sendVulnsNotification(props.vulnsTopicArn, errorMessage, props.imageUri);
  }

  if (props.failOnVulnerability === 'false') {
    return funcResponse;
  }

  if (props.suppressErrorOnRollback === 'true' && (await isRollbackInProgress(event.StackId))) {
    console.log(
      `Vulnerabilities may be detected, but suppressing errors during rollback (suppressErrorOnRollback=true).\n${errorMessage}`,
    );
    return funcResponse;
  }

  throw new Error(errorMessage);
};

const makeOptions = (props: ScannerCustomResourceProps): string[] => {
  const options: string[] = [];

  if (props.ignoreUnfixed === 'true') options.push('--ignore-unfixed');
  if (props.severity.length) options.push(`--severity ${props.severity.join(',')}`);
  if (props.scanners.length) options.push(`--scanners ${props.scanners.join(',')}`);
  if (props.imageConfigScanners.length)
    options.push(`--image-config-scanners ${props.imageConfigScanners.join(',')}`);
  // TODO: Remove exitCode and exitOnEol properties in the next major version, as they are now controlled by failOnVulnerability.
  if (props.exitCode) options.push(`--exit-code ${props.exitCode}`);
  if (props.exitOnEol) options.push(`--exit-on-eol ${props.exitOnEol}`);
  // Always set them in V2 to ensure vulnerabilities are detected for SNS notifications, even when failOnVulnerability is false.
  // The actual deployment failure is controlled by the exit code handling logic in the handler, not by Trivy's exit code.
  if (props.exitCode == undefined) options.push('--exit-code 1 --exit-on-eol 1');
  if (props.trivyIgnore.length) {
    const ignoreFilePath =
      props.trivyIgnoreFileType === 'TRIVYIGNORE_YAML'
        ? TRIVY_IGNORE_YAML_FILE_PATH
        : TRIVY_IGNORE_FILE_PATH;
    options.push(`--ignorefile ${ignoreFilePath}`);
  }
  if (props.platform) options.push(`--platform ${props.platform}`);

  return options;
};

const makeTrivyIgnoreFile = (trivyIgnore: string[], fileType?: string) => {
  const filePath =
    fileType === 'TRIVYIGNORE_YAML' ? TRIVY_IGNORE_YAML_FILE_PATH : TRIVY_IGNORE_FILE_PATH;
  writeFileSync(filePath, trivyIgnore.join('\n'), 'utf-8');
};

const outputScanLogs = async (
  response: SpawnSyncReturns<Buffer>,
  imageUri: string,
  output?: ScanLogsOutputOptions,
) => {
  switch (output?.type) {
    case ScanLogsOutputType.CLOUDWATCH_LOGS:
      await outputScanLogsToCWLogs(response, output as CloudWatchLogsOutputOptions, imageUri);
      break;
    case ScanLogsOutputType.S3:
      await outputScanLogsToS3(response, output as S3OutputOptions, imageUri);
      break;
    default:
      // Scan logs output to lambda default log group
      console.log('stderr:\n' + response.stderr.toString());
      console.log('stdout:\n' + response.stdout.toString());
  }
};

const outputScanLogsToCWLogs = async (
  response: SpawnSyncReturns<Buffer>,
  output: CloudWatchLogsOutputOptions,
  imageUri: string,
) => {
  // LogStream name must satisfy regular expression pattern: `[^:*]*`.
  // So, we can't use `:` in logStreamName.
  const [uri, tag] = imageUri.split(':');
  const logStreamName = tag ? `uri=${uri},tag=${tag}` : `uri=${uri}`;

  // Ensure log stream exists before putting log events.
  try {
    await cwClient.send(
      new CreateLogStreamCommand({
        logGroupName: output.logGroupName,
        logStreamName,
      }),
    );
  } catch (e) {
    // If the log stream already exists, ignore the error.
    if (e instanceof ResourceAlreadyExistsException) {
      console.log(
        `Log stream ${logStreamName} already exists in log group ${output.logGroupName}.`,
      );
    } else {
      throw e;
    }
  }

  const timestamp = new Date().getTime();
  const input: PutLogEventsCommandInput = {
    logGroupName: output.logGroupName,
    logStreamName: logStreamName,
    logEvents: [
      {
        timestamp,
        message: 'stderr:\n' + response.stderr.toString(),
      },
      {
        timestamp,
        message: 'stdout:\n' + response.stdout.toString(),
      },
    ],
  };
  const command = new PutLogEventsCommand(input);
  await cwClient.send(command);

  console.log(
    `Scan logs output to the log group: ${output.logGroupName}, log stream: ${logStreamName}`,
  );
};

const outputScanLogsToS3 = async (
  response: SpawnSyncReturns<Buffer>,
  output: S3OutputOptions,
  imageUri: string,
) => {
  const timestamp = new Date().toISOString();
  // S3 object key: Replace ':' with '/' for better organization
  const [uri, tag] = imageUri.split(':');
  const sanitizedUri = uri.replace(/\//g, '_');
  const sanitizedTag = tag ? tag.replace(/\//g, '_') : 'latest';

  // Ensure prefix ends with '/' if provided
  const prefix = output.prefix
    ? output.prefix.endsWith('/')
      ? output.prefix
      : `${output.prefix}/`
    : '';
  const basePath = `${prefix}${sanitizedUri}/${sanitizedTag}/${timestamp}`;

  const stderrContent = response.stderr.toString();
  const stdoutContent = response.stdout.toString();

  // Upload stderr and stdout as separate files
  await Promise.all([
    s3Client.send(
      new PutObjectCommand({
        Bucket: output.bucketName,
        Key: `${basePath}/stderr.txt`,
        Body: stderrContent,
        ContentType: 'text/plain',
      }),
    ),
    s3Client.send(
      new PutObjectCommand({
        Bucket: output.bucketName,
        Key: `${basePath}/stdout.txt`,
        Body: stdoutContent,
        ContentType: 'text/plain',
      }),
    ),
  ]);

  console.log(
    `Scan logs output to S3:\n  stderr: s3://${output.bucketName}/${basePath}/stderr.txt\n  stdout: s3://${output.bucketName}/${basePath}/stdout.txt`,
  );
};

const isRollbackInProgress = async (stackId: string): Promise<boolean> => {
  const command = new DescribeStacksCommand({
    StackName: stackId,
  });
  const response = await cfnClient.send(command);

  if (response.Stacks && response.Stacks.length > 0) {
    const stackStatus = response.Stacks[0].StackStatus;
    return (
      stackStatus === ResourceStatus.ROLLBACK_IN_PROGRESS ||
      stackStatus === ResourceStatus.UPDATE_ROLLBACK_IN_PROGRESS
    );
  }

  throw new Error(
    `Stack not found or no stacks returned from DescribeStacks command, stackId: ${stackId}`,
  );
};

const sendVulnsNotification = async (topicArn: string, errorMessage: string, imageUri: string) => {
  // AWS Chatbot message format
  // Reference: https://docs.aws.amazon.com/chatbot/latest/adminguide/custom-notifs.html
  const chatbotMessage = {
    version: '1.0',
    source: 'custom',
    content: {
      title: '🔒 Image Scanner with Trivy - Vulnerability Alert',
      description: `Image: ${imageUri}\n\nDetails:\n${errorMessage}`,
    },
  };

  // Email
  const plainTextMessage = `Image Scanner with Trivy detected vulnerabilities in ${imageUri}\n\n${errorMessage}`;

  // SNS message structure: Supports both Email and Chatbot
  // Default is plain text for Email
  // Use JSON format for HTTPS protocol (Chatbot)
  const messageStructure = {
    default: plainTextMessage,
    email: plainTextMessage,
    https: JSON.stringify(chatbotMessage),
  };

  try {
    await snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: JSON.stringify(messageStructure),
        MessageStructure: 'json',
      }),
    );
    console.log(`Vulnerability notification sent to SNS topic: ${topicArn}`);
  } catch (error) {
    console.error(`Failed to send vulnerability notification to SNS: ${error}`);
    // Don't block deployment on notification failure
  }
};
