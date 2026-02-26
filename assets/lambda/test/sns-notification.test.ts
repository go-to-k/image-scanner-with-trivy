import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { mockClient } from 'aws-sdk-client-mock';
import { sendVulnsNotification } from '../lib/sns-notification';
import { ScanLogsOutputType } from '../../../src/scan-logs-output';

const snsMock = mockClient(SNSClient);

describe('sns-notification', () => {
  beforeEach(() => {
    snsMock.reset();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendVulnsNotification', () => {
    const topicArn = 'arn:aws:sns:us-east-1:123456789012:test-topic';
    const errorMessage = 'Test error message';
    const imageUri = 'test-image:latest';
    const defaultLogGroupName = '/aws/lambda/default-log-group';

    test('should generate scan logs location for default CloudWatch Logs', async () => {
      snsMock.on(PublishCommand).resolves({});

      await sendVulnsNotification(topicArn, errorMessage, imageUri, defaultLogGroupName);

      const call = snsMock.call(0);
      const messageStructure = JSON.parse((call.args[0] as PublishCommand).input.Message!);

      expect(messageStructure.default).toContain('CloudWatch Logs: /aws/lambda/default-log-group');
    });

    test('should generate scan logs location for custom CloudWatch Logs', async () => {
      snsMock.on(PublishCommand).resolves({});

      const output = {
        type: ScanLogsOutputType.CLOUDWATCH_LOGS,
        logGroupName: '/custom/log/group',
      };

      await sendVulnsNotification(topicArn, errorMessage, imageUri, defaultLogGroupName, output);

      const call = snsMock.call(0);
      const messageStructure = JSON.parse((call.args[0] as PublishCommand).input.Message!);

      expect(messageStructure.default).toContain('CloudWatch Logs: /custom/log/group');
    });

    test('should generate scan logs location for S3 with prefix', async () => {
      snsMock.on(PublishCommand).resolves({});

      const output = {
        type: ScanLogsOutputType.S3,
        bucketName: 'test-bucket',
        prefix: 'scan-logs',
      };

      await sendVulnsNotification(topicArn, errorMessage, imageUri, defaultLogGroupName, output);

      const call = snsMock.call(0);
      const messageStructure = JSON.parse((call.args[0] as PublishCommand).input.Message!);

      expect(messageStructure.default).toContain('S3: s3://test-bucket/scan-logs');
    });

    test('should handle SNS publish errors gracefully', async () => {
      snsMock.on(PublishCommand).rejects(new Error('SNS publish failed'));

      await expect(
        sendVulnsNotification(topicArn, errorMessage, imageUri, defaultLogGroupName),
      ).resolves.not.toThrow();
    });
  });
});
