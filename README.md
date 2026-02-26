# image-scanner-with-trivy

TODO: V2 migration and changes between V1 and V2.

## What is

This is an AWS CDK Construct that allows you to **scan container images with Trivy in CDK deployment layer**.

If it detects vulnerabilities, it can **prevent the image from being pushed to the ECR for the application**.

Since it takes an `imageUri` for ECR as an argument, it can also be used to **simply scan an existing image in the repository**.

## Trivy

[Trivy](https://github.com/aquasecurity/trivy) is a comprehensive and versatile security scanner.

## Usage

### Install

```sh
npm install image-scanner-with-trivy
```

### CDK Code

The following code is a minimal example.

```ts
import { ImageScannerWithTrivy } from 'image-scanner-with-trivy';

const repository = new Repository(this, 'ImageRepository', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteImages: true,
});

const image = new DockerImageAsset(this, 'DockerImage', {
  directory: resolve(__dirname, './'),
});

const ecrDeployment = new ECRDeployment(this, 'DeployImage', {
  src: new DockerImageName(image.imageUri),
  dest: new DockerImageName(`${repository.repositoryUri}:latest`),
});

const imageScanner = new ImageScannerWithTrivy(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // If vulnerabilities are detected, the following `ECRDeployment` will not be executed, deployment will fail.
  // Note: This option only works when `failOnVulnerability` is `true` (default).
  blockConstructs: [ecrDeployment],
});
```

### Scan Logs Output

If you output the scan logs to other than the default log group, you can specify the `scanLogsOutput` option.

This option is useful when you want to choose where to output the scan logs.

You can output scan logs to CloudWatch Logs or S3.

#### CloudWatch Logs

You can output scan logs to a specific CloudWatch Logs log group using `ScanLogsOutput.cloudWatchLogs`.

```ts
const scanLogsLogGroup = new LogGroup(this, 'ScanLogsLogGroup');

const imageScanner = new ImageScannerWithTrivy(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Use `ScanLogsOutput.cloudWatchLogs` method to specify the log group.
  scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup: scanLogsLogGroup }),
});
```

#### S3

You can output scan logs to an S3 bucket using `ScanLogsOutput.s3`.

```ts
const scanLogsBucket = new Bucket(this, 'ScanLogsBucket');

const imageScanner = new ImageScannerWithTrivy(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Use `ScanLogsOutput.s3` method to specify the S3 bucket.
  scanLogsOutput: ScanLogsOutput.s3({
    bucket: scanLogsBucket,
    prefix: 'scan-logs/', // Optional: specify a prefix for S3 objects
  }),
});
```

Additionally, you can output SBOM (Software Bill of Materials) in various formats by specifying the `sbomFormat` option.

Available SBOM formats:

- `SbomFormat.CYCLONEDX` - CycloneDX JSON format
- `SbomFormat.SPDX_JSON` - SPDX JSON format
- `SbomFormat.SPDX` - SPDX Tag-Value format (human-readable)

```ts
const scanLogsBucket = new Bucket(this, 'ScanLogsBucket');

const imageScanner = new ImageScannerWithTrivy(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Use `ScanLogsOutput.s3` method to specify the S3 bucket.
  scanLogsOutput: ScanLogsOutput.s3({
    bucket: scanLogsBucket,
    sbomFormat: SbomFormat.CYCLONEDX, // Optional: output SBOM in CycloneDX format
  }),
});
```

### Default Log Group

If you want to use a custom log group for the Scanner Lambda function's default log group, you can specify the `defaultLogGroup` option.

If you use ImageScannerWithTrivy construct multiple times in the same stack, you have to set the same log group for `defaultLogGroup` for each construct.
When you set different log groups for each construct, a warning message will be displayed.

```ts
import { ImageScannerWithTrivy } from 'image-scanner-with-trivy';

const repository = new Repository(this, 'ImageRepository', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteImages: true,
});

const image = new DockerImageAsset(this, 'DockerImage', {
  directory: resolve(__dirname, './'),
});

const logGroup = new LogGroup(this, 'LogGroup');

new ImageScannerWithTrivy(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Specify the log group to use as the default log group for Scanner Lambda.
  defaultLogGroup: logGroup,
});

// NG example
// When multiple ImageScannerWithTrivy constructs have different default log groups, a warning will be displayed.
new ImageScannerWithTrivy(this, 'ImageScannerWithTrivyWithAnotherDefaultLogGroup', {
  imageUri: image.imageUri,
  repository: image.repository,
  defaultLogGroup: new LogGroup(this, 'AnotherDefaultLogGroup'), // NG example - different log group from the previous construct
  // defaultLogGroup: logGroup, // OK example - use the same log group for all constructs
});
```

### Rollback Error Suppression

By default, the `suppressErrorOnRollback` property is set to `true`.

When image scanning fails, CloudFormation triggers a rollback and executes the previous version
of the scanner Lambda. If this property is set to `true`, the previous version of the scanner
Lambda will not throw an error, even if the image scanning for the previous version fails.

This allows the rollback to complete successfully, avoiding ROLLBACK_FAILED state
when image scanning failures occur.

```ts
import { ImageScannerWithTrivy } from 'image-scanner-with-trivy';

const repository = new Repository(this, 'ImageRepository', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteImages: true,
});

const image = new DockerImageAsset(this, 'DockerImage', {
  directory: resolve(__dirname, './'),
});

new ImageScannerWithTrivy(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Default is true - suppress errors during rollback to prevent ROLLBACK_FAILED
  suppressErrorOnRollback: true,
  // Set to false if you want rollback errors to be thrown
  suppressErrorOnRollback: false,
});
```

### SNS Notification for Vulnerabilities

You can configure an SNS topic to receive notifications when vulnerabilities or EOL (End of Life) OS are detected.

The notification is sent **regardless of the `failOnVulnerability` setting**. This means you can receive notifications even when you don't want the deployment to fail.

```ts
import { ImageScannerWithTrivy } from 'image-scanner-with-trivy';
import { Topic } from 'aws-cdk-lib/aws-sns';

const repository = new Repository(this, 'ImageRepository', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteImages: true,
});

const image = new DockerImageAsset(this, 'DockerImage', {
  directory: resolve(__dirname, './'),
});

const notificationTopic = new Topic(this, 'VulnerabilityNotificationTopic');

new ImageScannerWithTrivy(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Receive notifications for vulnerabilities and EOL detection
  vulnsNotificationTopic: notificationTopic,
  // You can choose not to fail the deployment while still receiving notifications
  failOnVulnerability: false,
});
```

You can specify an SNS topic associated with AWS Chatbot, as notifications are sent in AWS Chatbot message format.

## Trivy's official documentation

To my surprise, this library was featured on the ecosystem page of [Trivy's official documentation](https://trivy.dev/docs/latest/ecosystem/ide/#image-scanner-with-trivy-community)!

## API Reference

API Reference is [here](./API.md#api-reference-).
