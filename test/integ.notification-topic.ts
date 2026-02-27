import { resolve } from 'path';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { ImageScannerWithTrivyV2, ScanLogsOutput, SbomFormat } from '../src';

class NotificationTestSetup extends Construct {
  public readonly topic: Topic;
  public readonly queue: Queue;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.topic = new Topic(this, 'Topic');
    this.queue = new Queue(this, 'Queue');
    this.topic.addSubscription(new SqsSubscription(this.queue));
  }
}

const app = new App();
const stack = new Stack(app, 'NotificationTopicStack');

const image = new DockerImageAsset(stack, 'DockerImage', {
  directory: resolve(__dirname, '../assets/lambda'),
  exclude: ['node_modules'],
  platform: Platform.LINUX_ARM64,
});

// Test 1: Default CloudWatch Logs (no scanLogsOutput specified)
const defaultTest = new NotificationTestSetup(stack, 'DefaultTest');
new ImageScannerWithTrivyV2(stack, 'ImageScannerDefault', {
  imageUri: image.imageUri,
  repository: image.repository,
  // trivyIgnore: TrivyIgnore.fromRules([...IGNORE_FOR_PASSING_TESTS]), // Intentionally do not ignore vulnerabilities to test SNS topic notifications
  failOnVulnerability: false, // Intentionally detect vulnerabilities to test SNS topic notifications
  vulnsNotificationTopic: defaultTest.topic,
});

// Test 2: CloudWatch Logs with custom log group
const cloudwatchTest = new NotificationTestSetup(stack, 'CloudWatchTest');
const customLogGroup = new LogGroup(stack, 'CustomLogGroup', {
  retention: RetentionDays.ONE_WEEK,
  removalPolicy: RemovalPolicy.DESTROY,
});
new ImageScannerWithTrivyV2(stack, 'ImageScannerCloudWatch', {
  imageUri: image.imageUri,
  repository: image.repository,
  failOnVulnerability: false,
  vulnsNotificationTopic: cloudwatchTest.topic,
  scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup: customLogGroup }),
});

// Test 3: S3 output
const s3Test = new NotificationTestSetup(stack, 'S3Test');
const logsBucket = new Bucket(stack, 'LogsBucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});
new ImageScannerWithTrivyV2(stack, 'ImageScannerS3', {
  imageUri: image.imageUri,
  repository: image.repository,
  failOnVulnerability: false,
  vulnsNotificationTopic: s3Test.topic,
  scanLogsOutput: ScanLogsOutput.s3({ bucket: logsBucket, prefix: 'scan-logs/' }),
});

// Test 4: S3 output with SBOM
const sbomTest = new NotificationTestSetup(stack, 'SBOMTest');
new ImageScannerWithTrivyV2(stack, 'ImageScannerSBOM', {
  imageUri: image.imageUri,
  repository: image.repository,
  failOnVulnerability: false,
  vulnsNotificationTopic: sbomTest.topic,
  scanLogsOutput: ScanLogsOutput.s3({
    bucket: logsBucket,
    prefix: 'sbom/',
    sbomFormat: SbomFormat.CYCLONEDX,
  }),
});

const test = new IntegTest(app, 'NotificationTopicTest', {
  testCases: [stack],
  diffAssets: true,
  stackUpdateWorkflow: false, // Disable stack update workflow to prevent test failures from new vulnerabilities discovered in previously successful snapshots.
});

// Verify that SNS notification was sent for default CloudWatch Logs
test.assertions
  .awsApiCall('SQS', 'receiveMessage', {
    QueueUrl: defaultTest.queue.queueUrl,
    WaitTimeSeconds: 20,
  })
  .assertAtPath('Messages.0.Body.Message', ExpectedResult.stringLikeRegexp('aws logs tail'))
  .waitForAssertions({
    interval: Duration.seconds(5),
    totalTimeout: Duration.minutes(3),
  });

// Verify that SNS notification was sent for custom CloudWatch Logs
test.assertions
  .awsApiCall('SQS', 'receiveMessage', {
    QueueUrl: cloudwatchTest.queue.queueUrl,
    WaitTimeSeconds: 20,
  })
  .assertAtPath('Messages.0.Body.Message', ExpectedResult.stringLikeRegexp('aws logs tail'))
  .waitForAssertions({
    interval: Duration.seconds(5),
    totalTimeout: Duration.minutes(3),
  });

// Verify that SNS notification was sent for S3 output
test.assertions
  .awsApiCall('SQS', 'receiveMessage', {
    QueueUrl: s3Test.queue.queueUrl,
    WaitTimeSeconds: 20,
  })
  .assertAtPath('Messages.0.Body.Message', ExpectedResult.stringLikeRegexp('aws s3 cp'))
  .waitForAssertions({
    interval: Duration.seconds(5),
    totalTimeout: Duration.minutes(3),
  });

// Verify that SNS notification was sent for SBOM output
test.assertions
  .awsApiCall('SQS', 'receiveMessage', {
    QueueUrl: sbomTest.queue.queueUrl,
    WaitTimeSeconds: 20,
  })
  .assertAtPath('Messages.0.Body.Message', ExpectedResult.stringLikeRegexp('aws s3 cp'))
  .waitForAssertions({
    interval: Duration.seconds(5),
    totalTimeout: Duration.minutes(3),
  });
