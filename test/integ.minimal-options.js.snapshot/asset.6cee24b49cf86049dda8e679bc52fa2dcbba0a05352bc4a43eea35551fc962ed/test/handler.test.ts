import { CdkCustomResourceEvent, Context } from 'aws-lambda';
import { handler } from '../lib/handler';
import * as trivyCommand from '../lib/trivy-command';
import * as cloudwatchLogs from '../lib/cloudwatch-logs';
import * as s3Output from '../lib/s3-output';
import * as snsNotification from '../lib/sns-notification';
import * as cloudformationUtils from '../lib/cloudformation-utils';
import { ScanLogsOutputType } from '../../../src/scan-logs-output';

jest.mock('../lib/trivy-command');
jest.mock('../lib/cloudwatch-logs');
jest.mock('../lib/s3-output');
jest.mock('../lib/sns-notification');
jest.mock('../lib/cloudformation-utils');

describe('handler', () => {
  const mockContext = {} as Context;
  const mockCallback = jest.fn();

  const baseEvent: CdkCustomResourceEvent = {
    RequestType: 'Create',
    ServiceToken: 'token',
    ResponseURL: 'https://example.com',
    StackId: 'stack-id',
    RequestId: 'request-id',
    LogicalResourceId: 'logical-id',
    ResourceType: 'Custom::ImageScannerWithTrivyV2',
    ResourceProperties: {
      ServiceToken: 'token',
      addr: 'test-addr',
      imageUri: 'my-image:v1.0',
      trivyIgnore: [],
      trivyIgnoreFileType: 'plain',
      defaultLogGroupName: '/aws/lambda/default',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    (trivyCommand.makeOptions as jest.Mock).mockReturnValue([]);
    (trivyCommand.executeTrivyCommand as jest.Mock).mockReturnValue({
      status: 0,
      stdout: Buffer.from(''),
      stderr: Buffer.from(''),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should return early for Delete request', async () => {
    const event = {
      ...baseEvent,
      RequestType: 'Delete' as const,
      PhysicalResourceId: 'test-addr',
    };

    const result = await handler(event, mockContext, mockCallback);

    expect(result?.PhysicalResourceId).toBe('test-addr');
    expect(trivyCommand.executeTrivyCommand).not.toHaveBeenCalled();
  });

  test('should return successfully when status is 0', async () => {
    (trivyCommand.executeTrivyCommand as jest.Mock).mockReturnValue({
      status: 0,
      stdout: Buffer.from(''),
      stderr: Buffer.from(''),
    });

    const result = await handler(baseEvent, mockContext, mockCallback);

    expect(result?.PhysicalResourceId).toBe('test-addr');
    expect(snsNotification.sendVulnsNotification).not.toHaveBeenCalled();
  });

  test('should return successfully when failOnVulnerability is false', async () => {
    (trivyCommand.executeTrivyCommand as jest.Mock).mockReturnValue({
      status: 1,
      stdout: Buffer.from(''),
      stderr: Buffer.from(''),
    });

    const event = {
      ...baseEvent,
      ResourceProperties: {
        ...baseEvent.ResourceProperties,
        failOnVulnerability: 'false',
      },
    };

    const result = await handler(event, mockContext, mockCallback);

    expect(result?.PhysicalResourceId).toBe('test-addr');
  });

  test('should suppress error when suppressErrorOnRollback is true and rollback is in progress', async () => {
    (trivyCommand.executeTrivyCommand as jest.Mock).mockReturnValue({
      status: 1,
      stdout: Buffer.from(''),
      stderr: Buffer.from(''),
    });
    (cloudformationUtils.isRollbackInProgress as jest.Mock).mockResolvedValue(true);

    const event = {
      ...baseEvent,
      ResourceProperties: {
        ...baseEvent.ResourceProperties,
        suppressErrorOnRollback: 'true',
      },
    };

    const result = await handler(event, mockContext, mockCallback);

    expect(result?.PhysicalResourceId).toBe('test-addr');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('suppressing errors during rollback'));
  });

  test('should throw error when vulnerabilities detected and no suppression', async () => {
    (trivyCommand.executeTrivyCommand as jest.Mock).mockReturnValue({
      status: 1,
      error: undefined,
      signal: null,
      stdout: Buffer.from(''),
      stderr: Buffer.from(''),
    });

    await expect(handler(baseEvent, mockContext, mockCallback)).rejects.toThrow('vulnerabilities or end-of-life (EOL) image detected');
  });

  test('should call outputScanLogsToCWLogsV2 when output type is CLOUDWATCH_LOGS and isV2', async () => {
    const event = {
      ...baseEvent,
      ResourceProperties: {
        ...baseEvent.ResourceProperties,
        output: {
          type: ScanLogsOutputType.CLOUDWATCH_LOGS,
          logGroupName: '/aws/lambda/test',
        },
      },
    };

    await handler(event, mockContext, mockCallback);

    expect(cloudwatchLogs.outputScanLogsToCWLogsV2).toHaveBeenCalled();
  });

  test('should call outputScanLogsToS3 when output type is S3', async () => {
    const event = {
      ...baseEvent,
      ResourceProperties: {
        ...baseEvent.ResourceProperties,
        output: {
          type: ScanLogsOutputType.S3,
          bucketName: 'test-bucket',
        },
      },
    };

    await handler(event, mockContext, mockCallback);

    expect(s3Output.outputScanLogsToS3).toHaveBeenCalled();
  });
});
