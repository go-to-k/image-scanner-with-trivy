import { SpawnSyncReturns } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3OutputOptions, SbomFormat } from '../../../src/scan-logs-output';
import { S3LogsDetails } from './types';

const s3Client = new S3Client();

export const outputScanLogsToS3 = async (
  response: SpawnSyncReturns<Buffer>,
  output: S3OutputOptions,
  imageUri: string,
): Promise<S3LogsDetails> => {
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

  const stderrKey = `${basePath}/stderr.txt`;
  const stdoutKey = `${basePath}/stdout.txt`;

  if (output.sbomFormat) {
    // SBOM mode: stdout contains SBOM JSON
    const extension = output.sbomFormat === SbomFormat.SPDX ? 'spdx' : 'json';
    const contentType = output.sbomFormat === SbomFormat.SPDX ? 'text/plain' : 'application/json';

    await s3Client.send(
      new PutObjectCommand({
        Bucket: output.bucketName,
        Key: `${basePath}/sbom.${extension}`,
        Body: stdoutContent,
        ContentType: contentType,
      }),
    );

    console.log(`SBOM output to S3: s3://${output.bucketName}/${basePath}/sbom.${extension}`);
  } else {
    // Normal scan mode: upload stderr and stdout
    await Promise.all([
      s3Client.send(
        new PutObjectCommand({
          Bucket: output.bucketName,
          Key: stderrKey,
          Body: stderrContent,
          ContentType: 'text/plain',
        }),
      ),
      s3Client.send(
        new PutObjectCommand({
          Bucket: output.bucketName,
          Key: stdoutKey,
          Body: stdoutContent,
          ContentType: 'text/plain',
        }),
      ),
    ]);

    console.log(
      `Scan logs output to S3:\n  stderr: s3://${output.bucketName}/${stderrKey}\n  stdout: s3://${output.bucketName}/${stdoutKey}`,
    );
  }

  return {
    type: 's3',
    bucketName: output.bucketName,
    stderrKey,
    stdoutKey,
  };
};
