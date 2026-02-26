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

      await outputScanLogsToCWLogsV2(response, output, 'my-image:v1.0');

      const createCalls = cwMock.commandCalls(CreateLogStreamCommand);
      const stdoutStream = createCalls.find(call =>
        call.args[0].input.logStreamName?.includes('/stdout')
      );
      const stderrStream = createCalls.find(call =>
        call.args[0].input.logStreamName?.includes('/stderr')
      );

      expect(stdoutStream!.args[0].input.logStreamName).toBe('uri=my-image,tag=v1.0/stdout');
      expect(stderrStream!.args[0].input.logStreamName).toBe('uri=my-image,tag=v1.0/stderr');
    });

    test('should generate log stream names without tag for stdout and stderr', async () => {
      cwMock.on(CreateLogStreamCommand).resolves({});
      cwMock.on(PutLogEventsCommand).resolves({});

      const response = createMockResponse('stdout', 'stderr');
      const output = {
        type: ScanLogsOutputType.CLOUDWATCH_LOGS,
        logGroupName: '/aws/lambda/test',
      };

      await outputScanLogsToCWLogsV2(response, output, 'my-image');

      const createCalls = cwMock.commandCalls(CreateLogStreamCommand);
      const stdoutStream = createCalls.find(call =>
        call.args[0].input.logStreamName?.includes('/stdout')
      );
      const stderrStream = createCalls.find(call =>
        call.args[0].input.logStreamName?.includes('/stderr')
      );

      expect(stdoutStream!.args[0].input.logStreamName).toBe('uri=my-image/stdout');
      expect(stderrStream!.args[0].input.logStreamName).toBe('uri=my-image/stderr');
    });

    test('should handle ResourceAlreadyExistsException gracefully', async () => {
      cwMock.on(CreateLogStreamCommand).rejects(new ResourceAlreadyExistsException({
        message: 'Log stream already exists',
        $metadata: {},
      }));
      cwMock.on(PutLogEventsCommand).resolves({});

      const response = createMockResponse('stdout', 'stderr');
      const output = {
        type: ScanLogsOutputType.CLOUDWATCH_LOGS,
        logGroupName: '/aws/lambda/test',
      };

      await expect(
        outputScanLogsToCWLogsV2(response, output, 'my-image:v1.0')
      ).resolves.not.toThrow();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('already exists')
      );
    });
  });
});
