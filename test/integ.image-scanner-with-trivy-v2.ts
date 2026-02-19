import { resolve } from 'path';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ImageScannerWithTrivyV2, ScanLogsOutput, Scanners, Severity } from '../src';

const app = new App();
const stack = new Stack(app, 'ImageScannerWithTrivyV2Stack');

const scanLogsOutputLogGroup = new LogGroup(stack, 'ScanLogsOutputLogGroup', {
  removalPolicy: RemovalPolicy.DESTROY,
});

const image = new DockerImageAsset(stack, 'DockerImage', {
  directory: resolve(__dirname, '../assets/lambda'),
  exclude: ['node_modules'],
  platform: Platform.LINUX_ARM64,
});

new ImageScannerWithTrivyV2(stack, 'ImageScannerWithTrivyV2WithMinimalOptions', {
  imageUri: image.imageUri,
  repository: image.repository,
  trivyIgnore: ['CVE-2023-37920', 'CVE-2025-7783', 'CVE-2025-68121'],
});

new ImageScannerWithTrivyV2(stack, 'ImageScannerWithTrivyV2WithAllOptions', {
  imageUri: image.imageUri,
  repository: image.repository,
  ignoreUnfixed: false,
  severity: [Severity.CRITICAL],
  scanners: [Scanners.VULN, Scanners.SECRET],
  failOnVulnerability: true,
  failOnEol: true,
  trivyIgnore: [
    'CVE-2023-37920',
    'CVE-2025-7783',
    'CVE-2025-68121',
    'CVE-2019-14697 exp:2023-01-01',
    'generic-unwanted-rule',
  ],
  memorySize: 3008,
  platform: 'linux/arm64',
  scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup: scanLogsOutputLogGroup }),
  defaultLogGroup: new LogGroup(stack, 'DefaultLogGroup', {
    removalPolicy: RemovalPolicy.DESTROY,
    retention: RetentionDays.ONE_DAY,
  }),
  suppressErrorOnRollback: true,
});

const test = new IntegTest(app, 'Test', {
  testCases: [stack],
  diffAssets: true,
});

test.assertions
  .awsApiCall('CloudWatchLogs', 'filterLogEvents', {
    logGroupName: scanLogsOutputLogGroup.logGroupName,
    limit: 1,
  })
  .assertAtPath('events.0.message', ExpectedResult.stringLikeRegexp('.+'))
  .waitForAssertions();
