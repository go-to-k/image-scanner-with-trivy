import {
  CloudWatchLogsClient,
  CreateLogStreamCommand,
  PutLogEventsCommand,
  ResourceAlreadyExistsException,
} from '@aws-sdk/client-cloudwatch-logs';
import { mockClient } from 'aws-sdk-client-mock';
import { SpawnSyncReturns } from 'child_process';
import { outputScanLogsToCWLogsV2 } from '../lib/cloudwatch-logs';
import { ScanLogsOutputType } from '../../../src/scan-logs-output';

const MAX_LOG_EVENT_SIZE = 1048576; // 1 MB in bytes

const cwMock = mockClient(CloudWatchLogsClient);

describe('cloudwatch-logs', () => {
  beforeEach(() => {
    cwMock.reset();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createMockResponse = (stdout: string, stderr: string): SpawnSyncReturns<Buffer> => ({
    pid: 1234,
    output: [null, Buffer.from(stdout), Buffer.from(stderr)],
    stdout: Buffer.from(stdout),
    stderr: Buffer.from(stderr),
    status: 0,
    signal: null,
  });

  describe('outputScanLogsToCWLogsV2', () => {
    test('should generate log stream names with tag for stdout and stderr', async () => {
      cwMock.on(CreateLogStreamCommand).resolves({});
      cwMock.on(PutLogEventsCommand).resolves({});

      const response = createMockResponse('stdout', 'stderr');
      const output = {
        type: ScanLogsOutputType.CLOUDWATCH_LOGS,
        logGroupName: '/aws/lambda/test',
      };

      const result = await outputScanLogsToCWLogsV2(response, output, 'my-image:v1.0');

      expect(result).toEqual({
        type: 'cloudwatch-v2',
        logGroupName: '/aws/lambda/test',
        stdoutLogStreamName: 'uri=my-image,tag=v1.0/stdout',
        stderrLogStreamName: 'uri=my-image,tag=v1.0/stderr',
      });
    });

    test('should generate log stream names without tag for stdout and stderr', async () => {
      cwMock.on(CreateLogStreamCommand).resolves({});
      cwMock.on(PutLogEventsCommand).resolves({});

      const response = createMockResponse('stdout', 'stderr');
      const output = {
        type: ScanLogsOutputType.CLOUDWATCH_LOGS,
        logGroupName: '/aws/lambda/test',
      };

      const result = await outputScanLogsToCWLogsV2(response, output, 'my-image');

      expect(result).toEqual({
        type: 'cloudwatch-v2',
        logGroupName: '/aws/lambda/test',
        stdoutLogStreamName: 'uri=my-image/stdout',
        stderrLogStreamName: 'uri=my-image/stderr',
      });
    });

    test('should handle ResourceAlreadyExistsException gracefully', async () => {
      cwMock.on(CreateLogStreamCommand).rejects(
        new ResourceAlreadyExistsException({
          message: 'Log stream already exists',
          $metadata: {},
        }),
      );
      cwMock.on(PutLogEventsCommand).resolves({});

      const response = createMockResponse('stdout', 'stderr');
      const output = {
        type: ScanLogsOutputType.CLOUDWATCH_LOGS,
        logGroupName: '/aws/lambda/test',
      };

      await expect(
        outputScanLogsToCWLogsV2(response, output, 'my-image:v1.0'),
      ).resolves.not.toThrow();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('already exists'));
    });

    test('should split and send large stdout messages', async () => {
      cwMock.on(CreateLogStreamCommand).resolves({});
      cwMock.on(PutLogEventsCommand).resolves({});

      // Create a large stdout message (2 MB)
      const largeStdout = 'a'.repeat(2 * MAX_LOG_EVENT_SIZE);
      const response = createMockResponse(largeStdout, 'stderr');
      const output = {
        type: ScanLogsOutputType.CLOUDWATCH_LOGS,
        logGroupName: '/aws/lambda/test',
      };

      await outputScanLogsToCWLogsV2(response, output, 'my-image:v1.0');

      // Verify PutLogEventsCommand was called
      const putLogEventsCalls = cwMock.commandCalls(PutLogEventsCommand);
      expect(putLogEventsCalls.length).toBe(2); // stdout + stderr

      // Verify stdout was split into multiple events
      const stdoutCall = putLogEventsCalls.find(
        (call) => call.args[0].input.logStreamName === 'uri=my-image,tag=v1.0/stdout',
      );
      expect(stdoutCall).toBeDefined();
      const logEvents = stdoutCall?.args[0].input.logEvents;
      expect(logEvents).toBeDefined();
      expect(logEvents!.length).toBeGreaterThan(1);

      // Verify each event has the [part X/Y] prefix
      logEvents!.forEach((event: any) => {
        expect(event.message).toMatch(/^\[part \d+\/\d+\]/);
      });
    });
  });
});
