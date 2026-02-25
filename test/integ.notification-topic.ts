import { resolve } from 'path';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { ImageScannerWithTrivyV2 } from '../src';

const app = new App();
const stack = new Stack(app, 'NotificationTopicStack');

const image = new DockerImageAsset(stack, 'DockerImage', {
  directory: resolve(__dirname, '../assets/lambda'),
  exclude: ['node_modules'],
  platform: Platform.LINUX_ARM64,
});

const topic = new Topic(stack, 'Topic');

// Create an SQS queue to capture SNS notifications for testing
const notificationQueue = new Queue(stack, 'NotificationQueue', {
  removalPolicy: RemovalPolicy.DESTROY,
});

// Subscribe the queue to the SNS topic
topic.addSubscription(new SqsSubscription(notificationQueue));

new ImageScannerWithTrivyV2(stack, 'ImageScanner', {
  imageUri: image.imageUri,
  repository: image.repository,
  // trivyIgnore: TrivyIgnore.fromRules([...IGNORE_FOR_PASSING_TESTS]), // Intentionally do not ignore vulnerabilities to test SNS topic notifications
  failOnVulnerability: false, // Intentionally detect vulnerabilities to test SNS topic notifications
  vulnsNotificationTopic: topic,
});

const test = new IntegTest(app, 'NotificationTopicTest', {
  testCases: [stack],
  diffAssets: true,
  stackUpdateWorkflow: false, // Disable stack update workflow to prevent test failures from new vulnerabilities discovered in previously successful snapshots.
});

// Verify that SNS notification was sent to the queue
test.assertions
  .awsApiCall('SQS', 'receiveMessage', {
    QueueUrl: notificationQueue.queueUrl,
    WaitTimeSeconds: 20,
  })
  .assertAtPath(
    'Messages.0.Body.Message',
    ExpectedResult.stringLikeRegexp('Image Scanner with Trivy detected vulnerabilities'),
  )
  .waitForAssertions({
    interval: Duration.seconds(5),
    totalTimeout: Duration.minutes(2),
  });
