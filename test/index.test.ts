import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { ImageScannerWithTrivy, ScanLogsOutput, Scanners, Severity } from '../src';

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
    trivyIgnore: ['CVE-2023-37920', 'CVE-2019-14697 exp:2023-01-01'],
    memorySize: 3008,
    platform: 'linux/arm64',
    scanLogsOutput: ScanLogsOutput.cloudWatchLogs(new LogGroup(stack, 'LogGroup')),
  });
  return Template.fromStack(stack);
};

describe('ImageScannerWithTrivy', () => {
  const template = getTemplate();

  test('Snapshot test', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

  test('ImageScannerWithTrivy created', () => {
    template.resourceCountIs('Custom::ImageScannerWithTrivy', 1);
  });

  test('correctly sets scanLogsOutput settings', () => {
    template.hasResourceProperties('Custom::ImageScannerWithTrivy', {
      output: {
        type: 'cloudWatchLogs',
        logGroupName: {
          Ref: 'LogGroupF5B46931',
        },
      },
    });
  });

  test('throws if memorySize > 10240', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    expect(() => {
      new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository', {}),
        memorySize: 10241,
      });
    }).toThrowError(/You can specify between \`3008\` and \`10240\` for \`memorySize\`, got 10241/);
  });

  test('throws if memorySize < 3008', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    expect(() => {
      new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository', {}),
        memorySize: 3007,
      });
    }).toThrowError(/You can specify between \`3008\` and \`10240\` for \`memorySize\`, got 3007/);
  });
});
