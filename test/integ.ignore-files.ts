import { resolve } from 'path';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import {
  ImageScannerWithTrivyV2,
  ScanLogsOutput,
  TargetImagePlatform,
  TrivyIgnore,
  TrivyIgnoreFileType,
} from '../src';

const app = new App();
const stack = new Stack(app, 'IgnoreFilesStack');

const scanLogsOutputLogGroup = new LogGroup(stack, 'ScanLogsOutputLogGroup', {
  removalPolicy: RemovalPolicy.DESTROY,
});

const image = new DockerImageAsset(stack, 'DockerImage', {
  directory: resolve(__dirname, '../assets/lambda'),
  exclude: ['node_modules'],
  platform: Platform.LINUX_ARM64,
});

new ImageScannerWithTrivyV2(stack, 'IgnoreYaml', {
  imageUri: image.imageUri,
  repository: image.repository,
  failOnVulnerability: true,
  targetImagePlatform: TargetImagePlatform.LINUX_ARM64,
  trivyIgnore: TrivyIgnore.fromFilePath(
    resolve(__dirname, 'ignore-files/.trivyignore.yaml'),
    TrivyIgnoreFileType.TRIVYIGNORE_YAML,
  ),
  scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup: scanLogsOutputLogGroup }),
});

new ImageScannerWithTrivyV2(stack, 'Ignore', {
  imageUri: image.imageUri,
  repository: image.repository,
  failOnVulnerability: true,
  targetImagePlatform: TargetImagePlatform.LINUX_ARM64,
  trivyIgnore: TrivyIgnore.fromFilePath(
    resolve(__dirname, 'ignore-files/.trivyignore'),
    TrivyIgnoreFileType.TRIVYIGNORE,
  ),
  scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup: scanLogsOutputLogGroup }),
});

const test = new IntegTest(app, 'IgnoreFilesTest', {
  testCases: [stack],
  diffAssets: true,
  stackUpdateWorkflow: false, // Disable stack update workflow to prevent test failures from new vulnerabilities discovered in previously successful snapshots.
});

test.assertions
  .awsApiCall('CloudWatchLogs', 'filterLogEvents', {
    logGroupName: scanLogsOutputLogGroup.logGroupName,
    limit: 1,
  })
  .assertAtPath('events.0.message', ExpectedResult.stringLikeRegexp('.+'))
  .waitForAssertions();
