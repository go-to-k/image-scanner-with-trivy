import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { App, Stack } from 'aws-cdk-lib';
import { Annotations, Match, Template } from 'aws-cdk-lib/assertions';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import {
  ImageScannerWithTrivyV2,
  ScanLogsOutput,
  Scanners,
  Severity,
  TargetImagePlatform,
  TrivyIgnore,
  TrivyIgnoreFileType,
} from '../src';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Effect } from 'aws-cdk-lib/aws-iam';

const getTemplate = (): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  const repository = new Repository(stack, 'ImageRepository', {});
  const topic = new Topic(stack, 'Topic');

  new ImageScannerWithTrivyV2(stack, 'ImageScannerWithTrivyV2', {
    imageUri: 'imageUri',
    repository: repository,
    ignoreUnfixed: true,
    severity: [Severity.CRITICAL, Severity.HIGH],
    scanners: [Scanners.VULN, Scanners.SECRET],
    failOnVulnerability: true,
    trivyIgnore: TrivyIgnore.fromRules(['CVE-2023-37920', 'CVE-2019-14697 exp:2023-01-01']),
    memorySize: 3008,
    targetImagePlatform: TargetImagePlatform.LINUX_ARM64,
    defaultLogGroup: new LogGroup(stack, 'DefaultLogGroup'),
    scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup: new LogGroup(stack, 'LogGroup') }),
    suppressErrorOnRollback: true,
    vulnsNotificationTopic: topic,
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

  describe('permissions', () => {
    test('has ECR permissions to pull the image', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            {
              Action: [
                'ecr:BatchCheckLayerAvailability',
                'ecr:GetDownloadUrlForLayer',
                'ecr:BatchGetImage',
              ],
              Effect: Effect.ALLOW,
              Resource: {
                'Fn::GetAtt': ['ImageRepositoryBBCBC9DF', 'Arn'],
              },
            },
          ]),
        },
      });
    });

    test('grants publish permissions to SNS topic if vulnsNotificationTopic is set', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            {
              Action: 'sns:Publish',
              Effect: Effect.ALLOW,
              Resource: {
                Ref: 'TopicBFC7AF6E',
              },
            },
          ]),
        },
      });
    });
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

  describe('defaultLogGroup', () => {
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
        Match.stringLikeRegexp(
          "You have to set the same log group for 'defaultLogGroup' for each ImageScannerWithTrivyV2 construct in the same stack.",
        ),
      );
      Annotations.fromStack(stack).hasWarning(
        '/TestStack/WithDefaultLogGroup',
        Match.stringLikeRegexp(
          "You have to set the same log group for 'defaultLogGroup' for each ImageScannerWithTrivyV2 construct in the same stack.",
        ),
      );
      Annotations.fromStack(stack).hasWarning(
        '/TestStack/WithAnotherDefaultLogGroup',
        Match.stringLikeRegexp(
          "You have to set the same log group for 'defaultLogGroup' for each ImageScannerWithTrivyV2 construct in the same stack.",
        ),
      );
    });

    test("don't warn when the default log groups are the same between ImageScannerWithTrivyV2 constructs", () => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');

      const defaultLogGroup = new LogGroup(stack, 'DefaultLogGroup');

      new ImageScannerWithTrivyV2(stack, 'WithDefaultLogGroup1', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository1', {}),
        defaultLogGroup,
      });
      new ImageScannerWithTrivyV2(stack, 'WithDefaultLogGroup2', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository2', {}),
        defaultLogGroup,
      });

      Annotations.fromStack(stack).hasNoWarning(
        '/TestStack/WithDefaultLogGroup1',
        Match.stringLikeRegexp(
          "You have to set the same log group for 'defaultLogGroup' for each ImageScannerWithTrivyV2 construct in the same stack.",
        ),
      );
      Annotations.fromStack(stack).hasNoWarning(
        '/TestStack/WithDefaultLogGroup2',
        Match.stringLikeRegexp(
          "You have to set the same log group for 'defaultLogGroup' for each ImageScannerWithTrivyV2 construct in the same stack.",
        ),
      );
    });

    test("don't warn when the default log groups are not set", () => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');

      new ImageScannerWithTrivyV2(stack, 'WithoutDefaultLogGroup1', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository1', {}),
      });
      new ImageScannerWithTrivyV2(stack, 'WithoutDefaultLogGroup2', {
        imageUri: 'imageUri',
        repository: new Repository(stack, 'ImageRepository2', {}),
      });

      Annotations.fromStack(stack).hasNoWarning(
        '/TestStack/WithoutDefaultLogGroup1',
        Match.stringLikeRegexp(
          "You have to set the same log group for 'defaultLogGroup' for each ImageScannerWithTrivyV2 construct in the same stack.",
        ),
      );
      Annotations.fromStack(stack).hasNoWarning(
        '/TestStack/WithoutDefaultLogGroup2',
        Match.stringLikeRegexp(
          "You have to set the same log group for 'defaultLogGroup' for each ImageScannerWithTrivyV2 construct in the same stack.",
        ),
      );
    });
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

describe('TrivyIgnore', () => {
  describe('TrivyIgnore.fromRules', () => {
    test('stores given rules as-is', () => {
      const rules = ['CVE-2018-14618', 'CVE-2019-14697 exp:2023-01-01', '# comment', ''];
      const result = TrivyIgnore.fromRules(rules);
      expect(result.rules).toEqual(rules);
    });

    test('fileType is set to undefined', () => {
      const rules = ['CVE-2018-14618', 'CVE-2019-14697 exp:2023-01-01', '# comment', ''];
      const result = TrivyIgnore.fromRules(rules);

      expect(result.fileType).toBe(undefined);
    });
  });

  describe('TrivyIgnore.fromFilePath', () => {
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = mkdtempSync(join(tmpdir(), 'trivy-ignore-test-'));
    });

    describe('.trivyignore', () => {
      test('reads file content as-is, line by line', () => {
        const filePath = join(tmpDir, '.trivyignore');
        const lines = [
          '# Accept the risk',
          'CVE-2018-14618',
          '',
          'CVE-2019-14697 exp:2023-01-01',
          'AVD-DS-0002',
        ];
        writeFileSync(filePath, lines.join('\n'), 'utf-8');

        const result = TrivyIgnore.fromFilePath(filePath);

        expect(result.rules).toEqual(lines);
      });

      test('fileType is set to TRIVYIGNORE as default', () => {
        const filePath = join(tmpDir, '.trivyignore');
        writeFileSync(filePath, 'CVE-2022-40897\n', 'utf-8');

        const result = TrivyIgnore.fromFilePath(filePath);

        expect(result.fileType).toBe(TrivyIgnoreFileType.TRIVYIGNORE);
      });
    });

    describe('.trivyignore.yaml', () => {
      test('reads file content as-is, line by line', () => {
        const filePath = join(tmpDir, '.trivyignore.yaml');
        const lines = [
          'vulnerabilities:',
          '  - id: CVE-2022-40897',
          '    paths:',
          '      - "usr/local/lib/python3.9/site-packages/setuptools-58.1.0.dist-info/METADATA"',
          '    statement: Accept the risk',
          '  - id: CVE-2023-2650',
          'misconfigurations:',
          '  - id: AVD-DS-0001',
          'secrets:',
          '  - id: aws-access-key-id',
          'licenses:',
          '  - id: GPL-3.0 # License name is used as ID',
        ];
        writeFileSync(filePath, lines.join('\n'), 'utf-8');

        const result = TrivyIgnore.fromFilePath(filePath, TrivyIgnoreFileType.TRIVYIGNORE_YAML);

        expect(result.rules).toEqual(lines);
      });

      test('fileType is set to TRIVYIGNORE_YAML', () => {
        const filePath = join(tmpDir, '.trivyignore.yaml');
        writeFileSync(filePath, 'vulnerabilities:\n  - id: CVE-2022-40897\n', 'utf-8');

        const result = TrivyIgnore.fromFilePath(filePath, TrivyIgnoreFileType.TRIVYIGNORE_YAML);

        expect(result.fileType).toBe(TrivyIgnoreFileType.TRIVYIGNORE_YAML);
      });
    });
  });
});
