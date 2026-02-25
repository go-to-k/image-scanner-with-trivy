import { resolve } from 'path';
import { AwsApiCall, ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import {
  ImageScannerWithTrivyV2,
  ScanLogsOutput,
  SbomFormat,
  TargetImagePlatform,
  TrivyIgnore,
} from '../src';

const IGNORE_FOR_PASSING_TESTS = [
  'CVE-2023-37920',
  'CVE-2025-7783',
  'CVE-2025-68121',
  'CVE-2026-25896',
];

const app = new App();
const stack = new Stack(app, 'ScanLogsOutputS3SbomStack');

const scanLogsOutputS3Bucket = new Bucket(stack, 'ScanLogsSbomBucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const image = new DockerImageAsset(stack, 'DockerImage', {
  directory: resolve(__dirname, '../assets/lambda'),
  exclude: ['node_modules'],
  platform: Platform.LINUX_ARM64,
});

// Test CycloneDX format
new ImageScannerWithTrivyV2(stack, 'ScannerCycloneDX', {
  imageUri: image.imageUri,
  repository: image.repository,
  trivyIgnore: TrivyIgnore.fromRules(IGNORE_FOR_PASSING_TESTS),
  targetImagePlatform: TargetImagePlatform.LINUX_ARM64,
  scanLogsOutput: ScanLogsOutput.s3({
    bucket: scanLogsOutputS3Bucket,
    prefix: 'cyclonedx',
    sbomFormat: SbomFormat.CYCLONEDX,
  }),
});

// Test SPDX JSON format
new ImageScannerWithTrivyV2(stack, 'ScannerSpdxJson', {
  imageUri: image.imageUri,
  repository: image.repository,
  trivyIgnore: TrivyIgnore.fromRules(IGNORE_FOR_PASSING_TESTS),
  targetImagePlatform: TargetImagePlatform.LINUX_ARM64,
  scanLogsOutput: ScanLogsOutput.s3({
    bucket: scanLogsOutputS3Bucket,
    prefix: 'spdx-json',
    sbomFormat: SbomFormat.SPDX_JSON,
  }),
});

// Test SPDX Tag-Value format
new ImageScannerWithTrivyV2(stack, 'ScannerSpdx', {
  imageUri: image.imageUri,
  repository: image.repository,
  trivyIgnore: TrivyIgnore.fromRules(IGNORE_FOR_PASSING_TESTS),
  targetImagePlatform: TargetImagePlatform.LINUX_ARM64,
  scanLogsOutput: ScanLogsOutput.s3({
    bucket: scanLogsOutputS3Bucket,
    prefix: 'spdx',
    sbomFormat: SbomFormat.SPDX,
  }),
});

const test = new IntegTest(app, 'ScanLogsOutputS3SbomTest', {
  testCases: [stack],
  diffAssets: true,
  stackUpdateWorkflow: false, // Disable stack update workflow to prevent test failures from new vulnerabilities discovered in previously successful snapshots.
});

// Verify CycloneDX output
const cycloneDxApiCall = test.assertions
  .awsApiCall('S3', 'listObjectsV2', {
    Bucket: scanLogsOutputS3Bucket.bucketName,
    Prefix: 'cyclonedx/',
    MaxKeys: 1,
  })
  .expect(
    ExpectedResult.objectLike({
      KeyCount: 1,
    }),
  )
  .waitForAssertions({
    interval: Duration.seconds(5),
    totalTimeout: Duration.minutes(2),
  });

if (cycloneDxApiCall instanceof AwsApiCall && cycloneDxApiCall.waiterProvider) {
  cycloneDxApiCall.waiterProvider.addToRolePolicy({
    Effect: 'Allow',
    Action: ['s3:GetObject', 's3:ListBucket'],
    Resource: ['*'],
  });
}

// Verify SPDX JSON output
const spdxJsonApiCall = test.assertions
  .awsApiCall('S3', 'listObjectsV2', {
    Bucket: scanLogsOutputS3Bucket.bucketName,
    Prefix: 'spdx-json/',
    MaxKeys: 1,
  })
  .expect(
    ExpectedResult.objectLike({
      KeyCount: 1,
    }),
  )
  .waitForAssertions({
    interval: Duration.seconds(5),
    totalTimeout: Duration.minutes(2),
  });

if (spdxJsonApiCall instanceof AwsApiCall && spdxJsonApiCall.waiterProvider) {
  spdxJsonApiCall.waiterProvider.addToRolePolicy({
    Effect: 'Allow',
    Action: ['s3:GetObject', 's3:ListBucket'],
    Resource: ['*'],
  });
}

// Verify SPDX Tag-Value output
const spdxApiCall = test.assertions
  .awsApiCall('S3', 'listObjectsV2', {
    Bucket: scanLogsOutputS3Bucket.bucketName,
    Prefix: 'spdx/',
    MaxKeys: 1,
  })
  .expect(
    ExpectedResult.objectLike({
      KeyCount: 1,
    }),
  )
  .waitForAssertions({
    interval: Duration.seconds(5),
    totalTimeout: Duration.minutes(2),
  });

if (spdxApiCall instanceof AwsApiCall && spdxApiCall.waiterProvider) {
  spdxApiCall.waiterProvider.addToRolePolicy({
    Effect: 'Allow',
    Action: ['s3:GetObject', 's3:ListBucket'],
    Resource: ['*'],
  });
}
