import { resolve } from 'path';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ImageScannerWithTrivy, ScanLogsOutput, Scanners, Severity } from '../src';

const app = new App();
const stack = new Stack(app, 'ImageScannerWithTrivyStack');

const logGroup = new LogGroup(stack, 'LogGroup', {
  removalPolicy: RemovalPolicy.DESTROY,
});

const image = new DockerImageAsset(stack, 'DockerImage', {
  directory: resolve(__dirname, '../assets/lambda'),
  exclude: ['node_modules'],
  platform: Platform.LINUX_ARM64,
});

new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy1', {
  imageUri: image.imageUri,
  repository: image.repository,
  trivyIgnore: ['CVE-2023-37920'],
});

new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy2', {
  imageUri: image.imageUri,
  repository: image.repository,
  ignoreUnfixed: false,
  severity: [Severity.CRITICAL],
  scanners: [Scanners.VULN, Scanners.SECRET],
  exitCode: 1,
  exitOnEol: 1,
  trivyIgnore: ['CVE-2023-37920', 'CVE-2019-14697 exp:2023-01-01', 'generic-unwanted-rule'],
  memorySize: 3008,
  platform: 'linux/arm64',
  scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup }),
});

new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy3', {
  imageUri: image.imageUri,
  repository: image.repository,
  trivyIgnore: ['CVE-2023-37920'],
  defaultLogGroupRemovalPolicy: RemovalPolicy.DESTROY,
  defaultLogGroupRetentionDays: RetentionDays.ONE_DAY,
});

const test = new IntegTest(app, 'Test', {
  testCases: [stack],
  diffAssets: true,
});

test.assertions
  .awsApiCall('CloudWatchLogs', 'filterLogEvents', {
    logGroupName: logGroup.logGroupName,
    limit: 1,
  })
  .assertAtPath('events.0.message', ExpectedResult.stringLikeRegexp('.+'))
  .waitForAssertions();
