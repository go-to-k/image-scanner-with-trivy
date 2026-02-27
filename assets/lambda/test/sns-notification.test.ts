import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { mockClient } from 'aws-sdk-client-mock';
import { sendVulnsNotification } from '../lib/sns-notification';

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

    test('should generate scan logs location for default CloudWatch Logs', async () => {
      snsMock.on(PublishCommand).resolves({});

      const logsDetails = {
        type: 'default' as const,
        logGroupName: '/aws/lambda/default-log-group',
      };

      await sendVulnsNotification(topicArn, errorMessage, imageUri, logsDetails);

      const call = snsMock.call(0);
      const messageStructure = JSON.parse((call.args[0] as PublishCommand).input.Message!);

      expect(messageStructure.default).toContain('CloudWatch Logs:');
      expect(messageStructure.default).toContain('/aws/lambda/default-log-group');
      expect(messageStructure.default).toContain('How to view logs:');
      expect(messageStructure.default).toContain('aws logs tail');
    });

    test('should generate scan logs location for CloudWatch Logs V1 with log stream details', async () => {
      snsMock.on(PublishCommand).resolves({});

      const logsDetails = {
        type: 'cloudwatch' as const,
        logGroupName: '/custom/log/group',
        logStreamName: 'uri=test-image,tag=latest',
      };

      await sendVulnsNotification(topicArn, errorMessage, imageUri, logsDetails);

      const call = snsMock.call(0);
      const messageStructure = JSON.parse((call.args[0] as PublishCommand).input.Message!);

      expect(messageStructure.default).toContain('CloudWatch Logs:');
      expect(messageStructure.default).toContain('Log Group: /custom/log/group');
      expect(messageStructure.default).toContain('Log Stream: uri=test-image,tag=latest');
      expect(messageStructure.default).toContain('How to view logs:');
      expect(messageStructure.default).toContain('aws logs get-log-events --log-group-name /custom/log/group --log-stream-name uri=test-image,tag=latest');
    });

    test('should generate scan logs location for CloudWatch Logs V2 with separate stdout/stderr streams', async () => {
      snsMock.on(PublishCommand).resolves({});

      const logsDetails = {
        type: 'cloudwatch-v2' as const,
        logGroupName: '/custom/log/group',
        stdoutLogStreamName: 'uri=test-image,tag=latest/stdout',
        stderrLogStreamName: 'uri=test-image,tag=latest/stderr',
      };

      await sendVulnsNotification(topicArn, errorMessage, imageUri, logsDetails);

      const call = snsMock.call(0);
      const messageStructure = JSON.parse((call.args[0] as PublishCommand).input.Message!);

      expect(messageStructure.default).toContain('CloudWatch Logs:');
      expect(messageStructure.default).toContain('Log Group: /custom/log/group');
      expect(messageStructure.default).toContain('Stdout Stream: uri=test-image,tag=latest/stdout');
      expect(messageStructure.default).toContain('Stderr Stream: uri=test-image,tag=latest/stderr');
      expect(messageStructure.default).toContain('How to view logs:');
      expect(messageStructure.default).toContain('# View stdout:');
      expect(messageStructure.default).toContain('# View stderr:');
    });

    test('should generate scan logs location for S3 with detailed keys', async () => {
      snsMock.on(PublishCommand).resolves({});

      const logsDetails = {
        type: 's3' as const,
        bucketName: 'test-bucket',
        stderrKey: 'scan-logs/test-image/latest/2024-01-01T00:00:00.000Z/stderr.txt',
        stdoutKey: 'scan-logs/test-image/latest/2024-01-01T00:00:00.000Z/stdout.txt',
      };

      await sendVulnsNotification(topicArn, errorMessage, imageUri, logsDetails);

      const call = snsMock.call(0);
      const messageStructure = JSON.parse((call.args[0] as PublishCommand).input.Message!);

      expect(messageStructure.default).toContain('S3:');
      expect(messageStructure.default).toContain('Bucket: test-bucket');
      expect(messageStructure.default).toContain('stderr: s3://test-bucket/scan-logs/test-image/latest/2024-01-01T00:00:00.000Z/stderr.txt');
      expect(messageStructure.default).toContain('stdout: s3://test-bucket/scan-logs/test-image/latest/2024-01-01T00:00:00.000Z/stdout.txt');
      expect(messageStructure.default).toContain('How to view logs:');
      expect(messageStructure.default).toContain('aws s3 cp');
    });

    test('should handle SNS publish errors gracefully', async () => {
      snsMock.on(PublishCommand).rejects(new Error('SNS publish failed'));

      const logsDetails = {
        type: 'default' as const,
        logGroupName: '/aws/lambda/default-log-group',
      };

      await expect(
        sendVulnsNotification(topicArn, errorMessage, imageUri, logsDetails),
      ).resolves.not.toThrow();
    });
  });
});
