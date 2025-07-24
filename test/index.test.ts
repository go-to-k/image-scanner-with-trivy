import { App, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Annotations, Match, Template } from 'aws-cdk-lib/assertions';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
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
    defaultLogGroupRemovalPolicy: RemovalPolicy.DESTROY,
    defaultLogGroupRetentionDays: RetentionDays.ONE_MONTH,
    scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup: new LogGroup(stack, 'LogGroup') }),
    suppressErrorOnRollback: true,
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

        new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy', {
          imageUri: 'imageUri',
          repository: repository,
          suppressErrorOnRollback: value,
        });

        Template.fromStack(stack).hasResourceProperties('Custom::ImageScannerWithTrivy', {
          suppressErrorOnRollback: expected,
        });
      },
    );
  });

  describe('scanLogsOutput settings', () => {
    test('correctly sets output configuration to cloudwatch logs', () => {
      template.hasResourceProperties('Custom::ImageScannerWithTrivy', {
        output: {
          type: 'cloudWatchLogs',
          logGroupName: {
            Ref: 'LogGroupF5B46931',
          },
        },
      });

      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Version: '2012-10-17',
          Statement: Match.arrayWith([
            {
              Action: ['logs:CreateLogStream', 'logs:PutLogEvents'],
              Effect: 'Allow',
              Resource: {
                'Fn::GetAtt': ['LogGroupF5B46931', 'Arn'],
              },
            },
          ]),
        },
      });
    });
  });

  describe('default log group settings', () => {
    test('create the default log group with removalPolicy and retentionInDays', () => {
      template.hasResource('AWS::Logs::LogGroup', {
        DeletionPolicy: 'Delete',
        Properties: {
          LogGroupName: {
            'Fn::Join': [
              '',
              [
                '/aws/lambda/',
                {
                  Ref: 'CustomImageScannerWithTrivyCustomResourceLambda470b6343d267f753226c1e99f09f319a884A34E3',
                },
              ],
            ],
          },
          RetentionInDays: 30,
        },
      });
    });

    test("don't create the default log group if none of the properties for the default log group are specified", () => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');

      new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy1', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository1', {}),
      });

      Template.fromStack(stack).resourceCountIs('AWS::Logs::LogGroup', 0);
    });

    test('only create one log group per singletonFunction and no warns', () => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');

      new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy1', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository1', {}),
        defaultLogGroupRemovalPolicy: RemovalPolicy.DESTROY,
        defaultLogGroupRetentionDays: RetentionDays.ONE_MONTH,
      });
      new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy2', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository2', {}),
        defaultLogGroupRemovalPolicy: RemovalPolicy.DESTROY,
        defaultLogGroupRetentionDays: RetentionDays.ONE_MONTH,
      });

      Template.fromStack(stack).resourceCountIs('AWS::Logs::LogGroup', 1);
      Annotations.fromStack(stack).hasNoWarning(
        '/TestStack/ImageScannerWithTrivy1',
        Match.stringLikeRegexp('You have to set the same values for.+'),
      );
      Annotations.fromStack(stack).hasNoWarning(
        '/TestStack/ImageScannerWithTrivy2',
        Match.stringLikeRegexp('You have to set the same values for.+'),
      );
    });

    test('warns when the default log group options are different between ImageScannerWithTrivy constructs', () => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');

      new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivy', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository1', {}),
        defaultLogGroupRemovalPolicy: RemovalPolicy.DESTROY,
        defaultLogGroupRetentionDays: RetentionDays.ONE_MONTH,
      });
      new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivyWithDifferentRemovalPolicy', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository2', {}),
        defaultLogGroupRemovalPolicy: RemovalPolicy.RETAIN,
        defaultLogGroupRetentionDays: RetentionDays.ONE_MONTH,
      });
      new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivyWithDifferentRetentionDays', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository3', {}),
        defaultLogGroupRemovalPolicy: RemovalPolicy.DESTROY,
        defaultLogGroupRetentionDays: RetentionDays.ONE_YEAR,
      });
      new ImageScannerWithTrivy(stack, 'ImageScannerWithTrivyWithNoDefaultLogGroupOptions', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository4', {}),
      });

      Annotations.fromStack(stack).hasNoWarning(
        '/TestStack/ImageScannerWithTrivy',
        Match.stringLikeRegexp('You have to set the same values for.+'),
      );
      Annotations.fromStack(stack).hasWarning(
        '/TestStack/ImageScannerWithTrivyWithDifferentRemovalPolicy',
        Match.stringLikeRegexp('You have to set the same values for.+'),
      );
      Annotations.fromStack(stack).hasWarning(
        '/TestStack/ImageScannerWithTrivyWithDifferentRetentionDays',
        Match.stringLikeRegexp('You have to set the same values for.+'),
      );
      Annotations.fromStack(stack).hasWarning(
        '/TestStack/ImageScannerWithTrivyWithNoDefaultLogGroupOptions',
        Match.stringLikeRegexp('You have to set the same values for.+'),
      );
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
