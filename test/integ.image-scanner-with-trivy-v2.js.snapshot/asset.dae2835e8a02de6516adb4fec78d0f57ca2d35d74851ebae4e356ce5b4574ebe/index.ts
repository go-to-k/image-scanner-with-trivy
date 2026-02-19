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
import { CdkCustomResourceHandler, CdkCustomResourceResponse } from 'aws-lambda';
import { ScannerCustomResourceProps } from '../../src/custom-resource-props';
import {
  ScanLogsOutputOptions,
  ScanLogsOutputType,
  CloudWatchLogsOutputOptions,
} from '../../src/scan-logs-output';

const TRIVY_IGNORE_FILE_PATH = '/tmp/.trivyignore';
const TRIVY_IGNORE_YAML_FILE_PATH = '/tmp/.trivyignore.yaml';

const cwClient = new CloudWatchLogsClient();
const cfnClient = new CloudFormationClient();

export const handler: CdkCustomResourceHandler = async function (event) {
  const requestType = event.RequestType;
  const props = event.ResourceProperties as unknown as ScannerCustomResourceProps;

  if (!props.addr || !props.imageUri) throw new Error('addr and imageUri are required.');

  const funcResponse: CdkCustomResourceResponse = {
    PhysicalResourceId: props.addr,
    Data: {} as { [key: string]: string },
  };

  if (requestType === 'Create' || requestType === 'Update') {
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

    if (response.status === 0) return funcResponse;

    const errorMessage = `Error: ${response.error}\nSignal: ${response.signal}\nStatus: ${response.status}\nImage Scanner returned fatal errors. You may have vulnerabilities. See logs.`;

    if (props.suppressErrorOnRollback === 'true' && (await isRollbackInProgress(event.StackId))) {
      console.log(
        `Vulnerabilities may be detected, but suppressing errors during rollback (suppressErrorOnRollback=true).\n${errorMessage}`,
      );
      return funcResponse;
    }

    throw new Error(errorMessage);
  }

  return funcResponse;
};

const makeOptions = (props: ScannerCustomResourceProps): string[] => {
  const options: string[] = [];

  if (props.ignoreUnfixed === 'true') options.push('--ignore-unfixed');
  if (props.severity.length) options.push(`--severity ${props.severity.join(',')}`);
  if (props.scanners.length) options.push(`--scanners ${props.scanners.join(',')}`);
  if (props.imageConfigScanners.length)
    options.push(`--image-config-scanners ${props.imageConfigScanners.join(',')}`);
  if (props.exitCode) options.push(`--exit-code ${props.exitCode}`);
  if (props.exitOnEol) options.push(`--exit-on-eol ${props.exitOnEol}`);
  if (props.trivyIgnore.length) {
    const ignoreFilePath =
      props.trivyIgnoreFileType === 'TRIVYIGNORE_YAML' ? TRIVY_IGNORE_YAML_FILE_PATH : TRIVY_IGNORE_FILE_PATH;
    options.push(`--ignorefile ${ignoreFilePath}`);
  }
  if (props.platform) options.push(`--platform ${props.platform}`);

  return options;
};

const makeTrivyIgnoreFile = (trivyIgnore: string[], fileType?: string) => {
  const filePath = fileType === 'TRIVYIGNORE_YAML' ? TRIVY_IGNORE_YAML_FILE_PATH : TRIVY_IGNORE_FILE_PATH;
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
