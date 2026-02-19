import { App, Stack } from 'aws-cdk-lib';
import { Annotations, Match, Template } from 'aws-cdk-lib/assertions';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { ImageScannerWithTrivyV2, ScanLogsOutput, Scanners, Severity } from '../src';

const getTemplate = (): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  const repository = new Repository(stack, 'ImageRepository', {});

  new ImageScannerWithTrivyV2(stack, 'ImageScannerWithTrivyV2', {
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
    defaultLogGroup: new LogGroup(stack, 'DefaultLogGroup'),
    scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup: new LogGroup(stack, 'LogGroup') }),
    suppressErrorOnRollback: true,
  });
  return Template.fromStack(stack);
};

describe('ImageScannerWithTrivyV2', () => {
  const template = getTemplate();

  test('Snapshot test', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

  test('ImageScannerWithTrivyV2 created', () => {
    template.resourceCountIs('Custom::ImageScannerWithTrivyV2', 1);
  });

  describe('suppressErrorOnRollback', () => {
    test.each([
      { value: true, expected: 'true' },
      { value: false, expected: 'false' },
      { value: undefined, expected: 'true' },
    ])(
      'suppressErrorOnRollback is set to $expected when value is $value',
      ({ value, expected }) => {
        const app = new App();
        const stack = new Stack(app, 'TestStack');

        const repository = new Repository(stack, 'ImageRepository', {});

        new ImageScannerWithTrivyV2(stack, 'ImageScannerWithTrivyV2', {
          imageUri: 'imageUri',
          repository: repository,
          suppressErrorOnRollback: value,
        });

        Template.fromStack(stack).hasResourceProperties('Custom::ImageScannerWithTrivyV2', {
          suppressErrorOnRollback: expected,
        });
      },
    );

    test.each([
      { suppressErrorOnRollback: true, shouldHavePolicy: true },
      { suppressErrorOnRollback: false, shouldHavePolicy: false },
      { suppressErrorOnRollback: undefined, shouldHavePolicy: true },
    ])(
      'CloudFormation DescribeStacks IAM policy is $shouldHavePolicy when suppressErrorOnRollback is $suppressErrorOnRollback',
      ({ suppressErrorOnRollback, shouldHavePolicy }) => {
        const app = new App();
        const stack = new Stack(app, 'TestStack');

        const repository = new Repository(stack, 'ImageRepository', {});

        new ImageScannerWithTrivyV2(stack, 'ImageScannerWithTrivyV2', {
          imageUri: 'imageUri',
          repository: repository,
          suppressErrorOnRollback,
        });

        const statementArray = [
          {
            Effect: 'Allow',
            Action: 'cloudformation:DescribeStacks',
            Resource: {
              Ref: 'AWS::StackId',
            },
          },
        ];
        Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: shouldHavePolicy
              ? Match.arrayWith(statementArray)
              : Match.not(Match.arrayWith(statementArray)),
          },
        });
      },
    );
  });

  test('warns per construct when the default log groups are different between ImageScannerWithTrivyV2 constructs', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    new ImageScannerWithTrivyV2(stack, 'WithNone', {
      imageUri: 'imageUri',
      repository: new Repository(stack, 'ImageRepository1', {}),
    });
    new ImageScannerWithTrivyV2(stack, 'WithDefaultLogGroup', {
      imageUri: 'imageUri',
      repository: new Repository(stack, 'ImageRepository2', {}),
      defaultLogGroup: new LogGroup(stack, 'DefaultLogGroup'),
    });
    new ImageScannerWithTrivyV2(stack, 'WithAnotherDefaultLogGroup', {
      imageUri: 'imageUri',
      repository: new Repository(stack, 'ImageRepository3', {}),
      defaultLogGroup: new LogGroup(stack, 'AnotherDefaultLogGroup'),
    });

    Annotations.fromStack(stack).hasWarning(
      '/TestStack/WithNone',
      Match.stringLikeRegexp('You have to set the same log group.+'),
    );
    Annotations.fromStack(stack).hasWarning(
      '/TestStack/WithDefaultLogGroup',
      Match.stringLikeRegexp('You have to set the same log group.+'),
    );
    Annotations.fromStack(stack).hasWarning(
      '/TestStack/WithAnotherDefaultLogGroup',
      Match.stringLikeRegexp('You have to set the same log group.+'),
    );
  });

  test('throws if memorySize > 10240', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    expect(() => {
      new ImageScannerWithTrivyV2(stack, 'ImageScannerWithTrivyV2', {
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
      new ImageScannerWithTrivyV2(stack, 'ImageScannerWithTrivyV2', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository', {}),
        memorySize: 3007,
      });
    }).toThrowError(/You can specify between \`3008\` and \`10240\` for \`memorySize\`, got 3007/);
  });
});
