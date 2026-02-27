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

/**
 * CloudWatch Logs has a limit of 1 MB per log event.
 * If the message exceeds this limit, it will be split into multiple log events.
 * Each chunk will be prefixed with [part X/Y] to indicate the sequence.
 */
export const MAX_LOG_EVENT_SIZE = 1048576; // 1 MB in bytes

/**
 * Splits a message into chunks that fit within CloudWatch Logs size limits.
 * @param message - The message to split
 * @returns Array of message chunks, each within the size limit
 */
export const splitMessageIntoChunks = (message: string): string[] => {
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);

  if (messageBytes.length <= MAX_LOG_EVENT_SIZE) {
    return [message];
  }

  const chunks: string[] = [];
  let currentPosition = 0;

  // Reserve space for the prefix like "[part 1/10] "
  const prefixReserve = 20;
  const chunkSize = MAX_LOG_EVENT_SIZE - prefixReserve;

  while (currentPosition < messageBytes.length) {
    const chunkBytes = messageBytes.slice(currentPosition, currentPosition + chunkSize);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    chunks.push(decoder.decode(chunkBytes));
    currentPosition += chunkSize;
  }

  return chunks;
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

  const chunks = splitMessageIntoChunks(message);
  const totalChunks = chunks.length;

  if (totalChunks > 1) {
    console.log(`Message size exceeds 1 MB limit. Splitting into ${totalChunks} chunks.`);
  }

  const logEvents = chunks.map((chunk, index) => ({
    timestamp: timestamp + index, // Increment timestamp slightly to maintain order
    message: totalChunks > 1 ? `[part ${index + 1}/${totalChunks}] ${chunk}` : chunk,
  }));

  const input: PutLogEventsCommandInput = {
    logGroupName,
    logStreamName,
    logEvents,
  };
  const command = new PutLogEventsCommand(input);
  await cwClient.send(command);
};
