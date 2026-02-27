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

      const result = await outputScanLogsToS3(response, output, 'my-image:v1.0');

      expect(result.type).toBe('s3');
      expect(result.stderrKey).toMatch(/^scan-logs\//);
      expect(result.stderrKey).not.toMatch(/^scan-logs\/\//);
      expect(result).toHaveProperty('stdoutKey');
      expect((result as any).stdoutKey).toMatch(/^scan-logs\//);
      expect((result as any).stdoutKey).not.toMatch(/^scan-logs\/\//);
    });

    test('should not duplicate trailing slash when prefix ends with slash', async () => {
      s3Mock.on(PutObjectCommand).resolves({});
      const response = createMockResponse('stdout', 'stderr');
      const output = {
        type: ScanLogsOutputType.S3,
        bucketName: 'test-bucket',
        prefix: 'scan-logs/',
      };

      const result = await outputScanLogsToS3(response, output, 'my-image:v1.0');

      expect(result.type).toBe('s3');
      expect(result.stderrKey).toMatch(/^scan-logs\//);
      expect(result.stderrKey).not.toMatch(/^scan-logs\/\//);
      expect(result).toHaveProperty('stdoutKey');
      expect((result as any).stdoutKey).toMatch(/^scan-logs\//);
      expect((result as any).stdoutKey).not.toMatch(/^scan-logs\/\//);
    });

    test('should upload stderr and stdout when sbomFormat is not provided', async () => {
      s3Mock.on(PutObjectCommand).resolves({});
      const response = createMockResponse('stdout content', 'stderr content');
      const output = {
        type: ScanLogsOutputType.S3,
        bucketName: 'test-bucket',
      };

      const result = await outputScanLogsToS3(response, output, 'my-image:v1.0');

      expect(s3Mock.calls()).toHaveLength(2);
      const calls = s3Mock.calls();
      const stderrCall = calls.find(call =>
        (call.args[0] as PutObjectCommand).input.Key?.includes('stderr.txt')
      );
      const stdoutCall = calls.find(call =>
        (call.args[0] as PutObjectCommand).input.Key?.includes('stdout.txt')
      );

      expect(stderrCall).toBeDefined();
      expect(stdoutCall).toBeDefined();

      const stderrKey = (stderrCall!.args[0] as PutObjectCommand).input.Key!;
      const stdoutKey = (stdoutCall!.args[0] as PutObjectCommand).input.Key!;

      // Verify return value
      expect(result).toEqual({
        type: 's3',
        bucketName: 'test-bucket',
        stderrKey,
        stdoutKey,
      });
    });

    test('should use .spdx extension and text/plain ContentType for SPDX format', async () => {
      s3Mock.on(PutObjectCommand).resolves({});
      const response = createMockResponse('SBOM content', 'stderr');
      const output = {
        type: ScanLogsOutputType.S3,
        bucketName: 'test-bucket',
        sbomFormat: SbomFormat.SPDX,
      };

      const result = await outputScanLogsToS3(response, output, 'my-image:v1.0');

      // Verify ContentType is set correctly
      const sbomCall = s3Mock.calls().find(call =>
        (call.args[0] as PutObjectCommand).input.Key?.includes('sbom.spdx')
      );
      expect(sbomCall).toBeDefined();
      expect((sbomCall!.args[0] as PutObjectCommand).input.ContentType).toBe('text/plain');

      // Verify return value
      expect(result.type).toBe('s3');
      expect(result.bucketName).toBe('test-bucket');
      expect(result.stderrKey).toMatch(/stderr\.txt$/);
      expect(result.stdoutKey).toMatch(/sbom\.spdx$/);
    });

    test('should use .json extension and application/json ContentType for non-SPDX SBOM format', async () => {
      s3Mock.on(PutObjectCommand).resolves({});
      const response = createMockResponse('SBOM content', 'stderr');
      const output = {
        type: ScanLogsOutputType.S3,
        bucketName: 'test-bucket',
        sbomFormat: SbomFormat.CYCLONEDX,
      };

      const result = await outputScanLogsToS3(response, output, 'my-image:v1.0');

      // Verify ContentType is set correctly
      const sbomCall = s3Mock.calls().find(call =>
        (call.args[0] as PutObjectCommand).input.Key?.includes('sbom.json')
      );
      expect(sbomCall).toBeDefined();
      expect((sbomCall!.args[0] as PutObjectCommand).input.ContentType).toBe('application/json');

      // Verify return value
      expect(result.type).toBe('s3');
      expect(result.bucketName).toBe('test-bucket');
      expect(result.stderrKey).toMatch(/stderr\.txt$/);
      expect(result.stdoutKey).toMatch(/sbom\.json$/);
    });
  });
});
