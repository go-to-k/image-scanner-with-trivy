import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { ImageScannerWithTrivyV2, ScanLogsOutput } from '../src';

const getTemplate = (): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  const repository = new Repository(stack, 'ImageRepository', {});

  new ImageScannerWithTrivyV2(stack, 'ImageScannerWithTrivyV2', {
    imageUri: 'imageUri',
    repository: repository,
    scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup: new LogGroup(stack, 'LogGroup') }),
  });
  return Template.fromStack(stack);
};

describe('scanLogsOutput settings', () => {
  const template = getTemplate();

  test('correctly sets output configuration to cloudwatch logs', () => {
    template.hasResourceProperties('Custom::ImageScannerWithTrivyV2', {
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
