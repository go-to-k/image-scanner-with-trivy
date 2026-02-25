import { resolve } from 'path';
import { AwsApiCall, ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { ImageScannerWithTrivyV2, ScanLogsOutput, TargetImagePlatform, TrivyIgnore } from '../src';

const IGNORE_FOR_PASSING_TESTS = [
  'CVE-2023-37920',
  'CVE-2025-7783',
  'CVE-2025-68121',
  'CVE-2026-25896',
];

const app = new App();
const stack = new Stack(app, 'ScanLogsOutputS3Stack');

const scanLogsOutputS3Bucket = new Bucket(stack, 'ScanLogsOutputS3Bucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const image = new DockerImageAsset(stack, 'DockerImage', {
  directory: resolve(__dirname, '../assets/lambda'),
  exclude: ['node_modules'],
  platform: Platform.LINUX_ARM64,
});

new ImageScannerWithTrivyV2(stack, 'Scanner', {
  imageUri: image.imageUri,
  repository: image.repository,
  trivyIgnore: TrivyIgnore.fromRules(IGNORE_FOR_PASSING_TESTS),
  targetImagePlatform: TargetImagePlatform.LINUX_ARM64,
  scanLogsOutput: ScanLogsOutput.s3({ bucket: scanLogsOutputS3Bucket }),
});

const test = new IntegTest(app, 'ScanLogsOutputS3Test', {
  testCases: [stack],
  diffAssets: true,
  stackUpdateWorkflow: false, // Disable stack update workflow to prevent test failures from new vulnerabilities discovered in previously successful snapshots.
});

const s3ApiCall = test.assertions
  .awsApiCall('S3', 'listObjectsV2', {
    Bucket: scanLogsOutputS3Bucket.bucketName,
    MaxKeys: 2,
  })
  .expect(
    ExpectedResult.objectLike({
      KeyCount: 2,
    }),
  )
  .waitForAssertions({
    interval: Duration.seconds(5),
    totalTimeout: Duration.minutes(2),
  });

if (s3ApiCall instanceof AwsApiCall && s3ApiCall.waiterProvider) {
  s3ApiCall.waiterProvider.addToRolePolicy({
    Effect: 'Allow',
    Action: ['s3:GetObject', 's3:ListBucket'],
    Resource: ['*'],
  });
}
