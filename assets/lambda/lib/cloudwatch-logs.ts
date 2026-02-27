import { SpawnSyncReturns } from 'child_process';
import {
  CloudWatchLogsClient,
  CreateLogStreamCommand,
  PutLogEventsCommand,
  PutLogEventsCommandInput,
  ResourceAlreadyExistsException,
} from '@aws-sdk/client-cloudwatch-logs';
import { CloudWatchLogsOutputOptions } from '../../../src/scan-logs-output';
import { CloudWatchLogsDetails, CloudWatchLogsV2Details } from './types';

const cwClient = new CloudWatchLogsClient();

// TODO: Remove this function in the next major version
export const outputScanLogsToCWLogs = async (
  response: SpawnSyncReturns<Buffer>,
  output: CloudWatchLogsOutputOptions,
  imageUri: string,
): Promise<CloudWatchLogsDetails> => {
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

  return {
    type: 'cloudwatch',
    logGroupName: output.logGroupName,
    logStreamName,
  };
};

export const outputScanLogsToCWLogsV2 = async (
  response: SpawnSyncReturns<Buffer>,
  output: CloudWatchLogsOutputOptions,
  imageUri: string,
): Promise<CloudWatchLogsV2Details> => {
  // LogStream name must satisfy regular expression pattern: `[^:*]*`.
  // So, we can't use `:` in logStreamName.
  const [uri, tag] = imageUri.split(':');
  const baseLogStreamName = tag ? `uri=${uri},tag=${tag}` : `uri=${uri}`;
  const stdoutLogStreamName = `${baseLogStreamName}/stdout`;
  const stderrLogStreamName = `${baseLogStreamName}/stderr`;

  const timestamp = new Date().getTime();

  // Create stdout log stream and put log events
  await createLogStreamAndPutEvents(
    output.logGroupName,
    stdoutLogStreamName,
    timestamp,
    response.stdout.toString(),
  );

  // Create stderr log stream and put log events
  await createLogStreamAndPutEvents(
    output.logGroupName,
    stderrLogStreamName,
    timestamp,
    response.stderr.toString(),
  );

  console.log(
    `Scan logs output to the log group: ${output.logGroupName}\n  stdout stream: ${stdoutLogStreamName}\n  stderr stream: ${stderrLogStreamName}`,
  );

  return {
    type: 'cloudwatch-v2',
    logGroupName: output.logGroupName,
    stdoutLogStreamName,
    stderrLogStreamName,
  };
};

const createLogStreamAndPutEvents = async (
  logGroupName: string,
  logStreamName: string,
  timestamp: number,
  message: string,
) => {
  // Ensure log stream exists before putting log events.
  try {
    await cwClient.send(
      new CreateLogStreamCommand({
        logGroupName,
        logStreamName,
      }),
    );
  } catch (e) {
    // If the log stream already exists, ignore the error.
    if (e instanceof ResourceAlreadyExistsException) {
      console.log(`Log stream ${logStreamName} already exists in log group ${logGroupName}.`);
    } else {
      throw e;
    }
  }

  const input: PutLogEventsCommandInput = {
    logGroupName,
    logStreamName,
    logEvents: [
      {
        timestamp,
        message,
      },
    ],
  };
  const command = new PutLogEventsCommand(input);
  await cwClient.send(command);
};
