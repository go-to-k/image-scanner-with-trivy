import { spawnSync, SpawnSyncReturns } from 'child_process';
import { writeFileSync } from 'fs';
import {
  CloudWatchLogsClient,
  CreateLogStreamCommand,
  PutLogEventsCommand,
  PutLogEventsCommandInput,
  ResourceAlreadyExistsException,
} from '@aws-sdk/client-cloudwatch-logs';
import { CdkCustomResourceHandler, CdkCustomResourceResponse } from 'aws-lambda';
import {
  ScanLogsOutputOptions,
  CloudWatchLogsOutputOptions,
  ScannerCustomResourceProps,
  ScanLogsOutputType,
} from '../../src/types';

const TRIVY_IGNORE_FILE_PATH = '/tmp/.trivyignore';

const cwClient = new CloudWatchLogsClient();

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
      makeTrivyIgnoreFile(props.trivyIgnore);
    }

    const cmd = `/opt/trivy image --no-progress ${options.join(' ')} ${props.imageUri}`;
    console.log('command: ' + cmd);
    console.log('imageUri: ' + props.imageUri);

    const response = spawnSync(cmd, {
      shell: true,
    });

    await outputScanLogs(response, props.imageUri, props.output);

    if (response.status !== 0)
      throw new Error(
        `Error: ${response.error}\nSignal: ${response.signal}\nStatus: ${response.status}\nImage Scanner returned fatal errors. You may have vulnerabilities. See logs.`,
      );
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
  if (props.trivyIgnore.length) options.push(`--ignorefile ${TRIVY_IGNORE_FILE_PATH}`);
  if (props.platform) options.push(`--platform ${props.platform}`);

  return options;
};

const makeTrivyIgnoreFile = (trivyIgnore: string[]) => {
  const ignoreLines = trivyIgnore.join('\n');
  writeFileSync(TRIVY_IGNORE_FILE_PATH, ignoreLines, 'utf-8');
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
