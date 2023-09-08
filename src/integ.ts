import { resolve } from 'path';
import { App, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { ImageScannerWithTrivy, Severity } from '.';

const app = new App();
const stack = new Stack(app, 'ImageScannerWithTrivyStack');

const image = new DockerImageAsset(stack, 'DockerImage', {
  directory: resolve(__dirname, '../assets/lambda'),
  platform: Platform.LINUX_ARM64,
});

new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy1', {
  imageUri: image.imageUri,
  repository: image.repository,
});

new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy2', {
  imageUri: image.imageUri,
  repository: image.repository,
  ignoreUnfixed: true,
});

new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy3', {
  imageUri: image.imageUri,
  repository: image.repository,
  severity: [],
});

new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy4', {
  imageUri: image.imageUri,
  repository: image.repository,
  ignoreUnfixed: false,
  severity: [Severity.CRITICAL, Severity.HIGH],
});
