import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { ScanLogsDetails } from './types';

const snsClient = new SNSClient();

export const sendVulnsNotification = async (
  topicArn: string,
  errorMessage: string,
  imageUri: string,
  logsDetails: ScanLogsDetails,
) => {
  // Generate scan logs location message with AWS CLI commands
  let scanLogsLocation = '';
  let awsCliCommand = '';

  if (logsDetails.type === 'cloudwatch') {
    scanLogsLocation = `CloudWatch Logs:\n  Log Group: ${logsDetails.logGroupName}\n  Log Stream: ${logsDetails.logStreamName}`;
    awsCliCommand = `aws logs tail ${logsDetails.logGroupName} --log-stream-names ${logsDetails.logStreamName}`;
  } else if (logsDetails.type === 'cloudwatch-v2') {
    scanLogsLocation = `CloudWatch Logs:\n  Log Group: ${logsDetails.logGroupName}\n  Stdout Stream: ${logsDetails.stdoutLogStreamName}\n  Stderr Stream: ${logsDetails.stderrLogStreamName}`;
    awsCliCommand = `# View stdout:\naws logs tail ${logsDetails.logGroupName} --log-stream-names ${logsDetails.stdoutLogStreamName}\n\n# View stderr:\naws logs tail ${logsDetails.logGroupName} --log-stream-names ${logsDetails.stderrLogStreamName}`;
  } else if (logsDetails.type === 's3') {
    scanLogsLocation = `S3:\n  Bucket: ${logsDetails.bucketName}\n  stderr: s3://${logsDetails.bucketName}/${logsDetails.stderrKey}\n  stdout: s3://${logsDetails.bucketName}/${logsDetails.stdoutKey}`;
    awsCliCommand = `# View stderr:\naws s3 cp s3://${logsDetails.bucketName}/${logsDetails.stderrKey} -\n\n# View stdout:\naws s3 cp s3://${logsDetails.bucketName}/${logsDetails.stdoutKey} -`;
  } else if (logsDetails.type === 'default') {
    scanLogsLocation = `CloudWatch Logs:\n  Log Group: ${logsDetails.logGroupName}`;
    awsCliCommand = `aws logs tail ${logsDetails.logGroupName}`;
  }

  const logsInfo = awsCliCommand
    ? `${scanLogsLocation}\n\nHow to view logs:\n${awsCliCommand}`
    : scanLogsLocation;

  // AWS Chatbot message format
  // Reference: https://docs.aws.amazon.com/chatbot/latest/adminguide/custom-notifs.html
  const chatbotMessage = {
    version: '1.0',
    source: 'custom',
    content: {
      title: '🔒 Image Scanner with Trivy - Vulnerability Alert',
      description: `Image: ${imageUri}\n\n${logsInfo}\n\nDetails:\n${errorMessage}`,
    },
  };

  // Email
  const plainTextMessage = `Image Scanner with Trivy detected vulnerabilities in ${imageUri}\n\n${logsInfo}\n\n${errorMessage}`;

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
