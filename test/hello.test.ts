import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { ImageScannerWithTrivy, Scanners, Severity } from '../src';

const getTemplate = (): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  const repository = new Repository(stack, 'ImageRepository', {});

  new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy', {
    imageUri: 'imageUri',
    repository: repository,
    ignoreUnfixed: true,
    severity: [Severity.CRITICAL, Severity.HIGH],
    scanners: [Scanners.VULN, Scanners.SECRET],
    exitCode: 1,
    exitOnEol: 1,
  });
  return Template.fromStack(stack);
};

describe('Fine-grained Assertions Tests', () => {
  const template = getTemplate();

  test('Snapshot test', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

  test('ImageScannerWithTrivy created', () => {
    template.resourceCountIs('Custom::ImageScannerWithTrivy', 1);
  });
});
