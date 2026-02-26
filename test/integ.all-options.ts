import { resolve } from 'path';
import { IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import {
  ImageScannerWithTrivyV2,
  Scanners,
  Severity,
  TargetImagePlatform,
  TrivyIgnore,
} from '../src';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

const IGNORE_FOR_PASSING_TESTS = [
  'CVE-2023-37920',
  'CVE-2025-7783',
  'CVE-2025-68121',
  'CVE-2026-25896',
];

const app = new App();
const stack = new Stack(app, 'AllOptionsStack');

const image = new DockerImageAsset(stack, 'DockerImage', {
  directory: resolve(__dirname, '../assets/lambda'),
  exclude: ['node_modules'],
  platform: Platform.LINUX_ARM64,
});

const blockedConstruct = new Construct(stack, 'BlockedConstruct');
new Queue(blockedConstruct, 'BlockedQueue');

new ImageScannerWithTrivyV2(stack, 'Scanner', {
  imageUri: image.imageUri,
  repository: image.repository,
  ignoreUnfixed: false,
  severity: [Severity.CRITICAL],
  scanners: [Scanners.VULN, Scanners.SECRET],
  failOnVulnerability: true,
  trivyIgnore: TrivyIgnore.fromRules([
    ...IGNORE_FOR_PASSING_TESTS,
    'CVE-2019-14697 exp:2023-01-01',
    'generic-unwanted-rule',
  ]),
  memorySize: 3008,
  targetImagePlatform: TargetImagePlatform.LINUX_ARM64,
  defaultLogGroup: new LogGroup(stack, 'DefaultLogGroup', {
    removalPolicy: RemovalPolicy.DESTROY,
    retention: RetentionDays.ONE_DAY,
  }),
  suppressErrorOnRollback: true,
  blockConstructs: [blockedConstruct],
});

new IntegTest(app, 'AllOptionsTest', {
  testCases: [stack],
  diffAssets: true,
  stackUpdateWorkflow: false, // Disable stack update workflow to prevent test failures from new vulnerabilities discovered in previously successful snapshots.
});
