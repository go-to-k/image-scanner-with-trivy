import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { SpawnSyncReturns } from 'child_process';
import { outputScanLogsToS3 } from '../lib/s3-output';
import { SbomFormat, ScanLogsOutputType } from '../../../src/scan-logs-output';

const s3Mock = mockClient(S3Client);

describe('s3-output', () => {
  beforeEach(() => {
    s3Mock.reset();
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

  describe('outputScanLogsToS3', () => {
    test('should add trailing slash when prefix does not end with slash', async () => {
      s3Mock.on(PutObjectCommand).resolves({});
      const response = createMockResponse('stdout', 'stderr');
      const output = {
        type: ScanLogsOutputType.S3,
        bucketName: 'test-bucket',
        prefix: 'scan-logs',
      };

      await outputScanLogsToS3(response, output, 'my-image:v1.0');

      const call = s3Mock.call(0);
      const key = (call.args[0] as PutObjectCommand).input.Key!;
      expect(key).toMatch(/^scan-logs\//);
      expect(key).not.toMatch(/^scan-logs\/\//);
    });

    test('should not duplicate trailing slash when prefix ends with slash', async () => {
      s3Mock.on(PutObjectCommand).resolves({});
      const response = createMockResponse('stdout', 'stderr');
      const output = {
        type: ScanLogsOutputType.S3,
        bucketName: 'test-bucket',
        prefix: 'scan-logs/',
      };

      await outputScanLogsToS3(response, output, 'my-image:v1.0');

      const call = s3Mock.call(0);
      const key = (call.args[0] as PutObjectCommand).input.Key!;
      expect(key).toMatch(/^scan-logs\//);
      expect(key).not.toMatch(/^scan-logs\/\//);
    });

    test('should upload stderr and stdout when sbomFormat is not provided', async () => {
      s3Mock.on(PutObjectCommand).resolves({});
      const response = createMockResponse('stdout content', 'stderr content');
      const output = {
        type: ScanLogsOutputType.S3,
        bucketName: 'test-bucket',
      };

      await outputScanLogsToS3(response, output, 'my-image:v1.0');

      expect(s3Mock.calls()).toHaveLength(2);
      const call = s3Mock.call(0);
      expect((call.args[0] as PutObjectCommand).input.Key).toMatch(/\.txt$/);
    });

    test('should use .spdx extension and text/plain ContentType for SPDX format', async () => {
      s3Mock.on(PutObjectCommand).resolves({});
      const response = createMockResponse('SBOM content', 'stderr');
      const output = {
        type: ScanLogsOutputType.S3,
        bucketName: 'test-bucket',
        sbomFormat: SbomFormat.SPDX,
      };

      await outputScanLogsToS3(response, output, 'my-image:v1.0');

      expect(s3Mock.calls()).toHaveLength(1);
      const call = s3Mock.call(0);
      const input = (call.args[0] as PutObjectCommand).input;
      expect(input.Key).toMatch(/sbom\.spdx$/);
      expect(input.ContentType).toBe('text/plain');
    });

    test('should use .json extension and application/json ContentType for non-SPDX SBOM format', async () => {
      s3Mock.on(PutObjectCommand).resolves({});
      const response = createMockResponse('SBOM content', 'stderr');
      const output = {
        type: ScanLogsOutputType.S3,
        bucketName: 'test-bucket',
        sbomFormat: SbomFormat.CYCLONEDX,
      };

      await outputScanLogsToS3(response, output, 'my-image:v1.0');

      expect(s3Mock.calls()).toHaveLength(1);
      const call = s3Mock.call(0);
      const input = (call.args[0] as PutObjectCommand).input;
      expect(input.Key).toMatch(/sbom\.json$/);
      expect(input.ContentType).toBe('application/json');
    });
  });
});
