import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import {
  ScanLogsOutputOptions,
  ScanLogsOutputType,
  CloudWatchLogsOutputOptions,
  S3OutputOptions,
} from '../../../src/scan-logs-output';

const snsClient = new SNSClient();

export const sendVulnsNotification = async (
  topicArn: string,
  errorMessage: string,
  imageUri: string,
  defaultLogGroupName: string,
  output?: ScanLogsOutputOptions,
) => {
  // Generate scan logs location message
  let scanLogsLocation = `CloudWatch Logs: ${defaultLogGroupName}`;
  if (output?.type === ScanLogsOutputType.CLOUDWATCH_LOGS) {
    const cwOutput = output as CloudWatchLogsOutputOptions;
    scanLogsLocation = `CloudWatch Logs: ${cwOutput.logGroupName}`;
  } else if (output?.type === ScanLogsOutputType.S3) {
    const s3Output = output as S3OutputOptions;
    const prefix = s3Output.prefix ? `/${s3Output.prefix}` : '';
    scanLogsLocation = `S3: s3://${s3Output.bucketName}${prefix}`;
  }

  // AWS Chatbot message format
  // Reference: https://docs.aws.amazon.com/chatbot/latest/adminguide/custom-notifs.html
  const chatbotMessage = {
    version: '1.0',
    source: 'custom',
    content: {
      title: '🔒 Image Scanner with Trivy - Vulnerability Alert',
      description: `Image: ${imageUri}\n\nScan Logs: ${scanLogsLocation}\n\nDetails:\n${errorMessage}`,
    },
  };

  // Email
  const plainTextMessage = `Image Scanner with Trivy detected vulnerabilities in ${imageUri}\n\nScan Logs: ${scanLogsLocation}\n\n${errorMessage}`;

  // SNS message structure: Supports both Email and Chatbot
  // Default is plain text for Email
  // Use JSON format for HTTPS protocol (Chatbot)
  const messageStructure = {
    default: plainTextMessage,
    email: plainTextMessage,
    https: JSON.stringify(chatbotMessage),
  };

  try {
    await snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: JSON.stringify(messageStructure),
        MessageStructure: 'json',
      }),
    );
    console.log(`Vulnerability notification sent to SNS topic: ${topicArn}`);
  } catch (error) {
    console.error(`Failed to send vulnerability notification to SNS: ${error}`);
    // Don't block deployment on notification failure
  }
};
