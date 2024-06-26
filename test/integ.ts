import { resolve } from 'path';
import { App, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { ImageScannerWithTrivy, Scanners, Severity } from '../src';

const app = new App();
const stack = new Stack(app, 'ImageScannerWithTrivyStack');

const image = new DockerImageAsset(stack, 'DockerImage', {
  directory: resolve(__dirname, '../assets/lambda'),
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
});
