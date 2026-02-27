import { resolve } from 'path';
import { IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { ImageScannerWithTrivyV2, TargetImagePlatform, TrivyIgnore } from '../src';

const IGNORE_FOR_PASSING_TESTS = [
  'CVE-2023-37920',
  'CVE-2025-7783',
  'CVE-2025-68121',
  'CVE-2026-25896',
];

const app = new App();
const stack = new Stack(app, 'MinimalOptionsStack');

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
});

new IntegTest(app, 'MinimalOptionsTest', {
  testCases: [stack],
  diffAssets: true,
  stackUpdateWorkflow: false, // Disable stack update workflow to prevent test failures from new vulnerabilities discovered in previously successful snapshots.
});
