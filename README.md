# image-scanner-with-trivy

## What is

This is an AWS CDK Construct that allows you to **scan container images with Trivy in CDK deployment layer**.

If it detects vulnerabilities, it can **prevent the image from being pushed to ECR, or block deployments to ECS, Lambda, and other services**. You can also choose to **receive notifications without failing the deployment**.

Scan results and **SBOM (Software Bill of Materials) can be output to S3** for further analysis and compliance reporting.

Since it takes an `imageUri` for ECR as an argument, it can also be used to **simply scan an existing image in the repository**.

## Trivy

[Trivy](https://github.com/aquasecurity/trivy) is a comprehensive and versatile security scanner.

**This library is featured on the ecosystem page of [Trivy's official documentation](https://trivy.dev/docs/latest/ecosystem/ide/#image-scanner-with-trivy-community)!**

## Usage

### Install

```sh
npm install image-scanner-with-trivy
```

### CDK Code

**Note: We recommend using `ImageScannerWithTrivyV2`.** See the [V2 Construct](#v2-construct) section for details and migration guide.

The following code is a minimal example that scans the image and blocks the ECS deployment if vulnerabilities are detected.

```ts
import { ImageScannerWithTrivyV2 } from 'image-scanner-with-trivy';

const image = new DockerImageAsset(this, 'DockerImage', {
  directory: resolve(__dirname, './'),
});

const cluster = new Cluster(this, 'Cluster');
const taskDefinition = new FargateTaskDefinition(this, 'TaskDef');
taskDefinition.addContainer('app', {
  image: ContainerImage.fromDockerImageAsset(image),
});
const fargateService = new FargateService(this, 'Service', {
  cluster,
  taskDefinition,
});

// Scan the image before deploying to ECS
const imageScanner = new ImageScannerWithTrivyV2(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // If vulnerabilities are detected, the ECS deployment will be blocked
  // Note: This option only works when `failOnVulnerability` is `true` (default).
  blockConstructs: [fargateService],
});
```

#### Other Use Cases

For scanning the image and blocking `ECRDeployment` (copying images from `DockerImageAsset` ECR to another ECR repository) if vulnerabilities are detected:

```ts
import { ImageScannerWithTrivyV2 } from 'image-scanner-with-trivy';

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

const imageScanner = new ImageScannerWithTrivyV2(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // If vulnerabilities are detected, the ECRDeployment will be blocked
  blockConstructs: [ecrDeployment],
});
```

### Default Log Group

If you want to use a custom log group for the Scanner Lambda function's default log group, you can specify the `defaultLogGroup` option.

If you use ImageScannerWithTrivyV2 construct multiple times in the same stack, you have to set the same log group for `defaultLogGroup` for each construct.
When you set different log groups for each construct, a warning message will be displayed.

```ts
import { ImageScannerWithTrivyV2 } from 'image-scanner-with-trivy';

const logGroup = new LogGroup(this, 'LogGroup');

new ImageScannerWithTrivyV2(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Specify the log group to use as the default log group for Scanner Lambda.
  defaultLogGroup: logGroup,
});

// NG example
// When multiple ImageScannerWithTrivyV2 constructs have different default log groups, a warning will be displayed.
new ImageScannerWithTrivyV2(this, 'ImageScannerWithTrivyWithAnotherDefaultLogGroup', {
  imageUri: anotherImage.imageUri,
  repository: anotherImage.repository,
  defaultLogGroup: new LogGroup(this, 'AnotherDefaultLogGroup'), // NG example - different log group from the previous construct
  // defaultLogGroup: logGroup, // OK example - use the same log group for all constructs
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

const imageScanner = new ImageScannerWithTrivyV2(this, 'ImageScannerWithTrivy', {
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

const imageScanner = new ImageScannerWithTrivyV2(this, 'ImageScannerWithTrivy', {
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

const imageScanner = new ImageScannerWithTrivyV2(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Use `ScanLogsOutput.s3` method to specify the S3 bucket.
  scanLogsOutput: ScanLogsOutput.s3({
    bucket: scanLogsBucket,
    sbomFormat: SbomFormat.CYCLONEDX, // Optional: output SBOM in CycloneDX format
  }),
});
```

### SNS Notification for Vulnerabilities

You can configure an SNS topic to receive notifications when vulnerabilities or EOL (End of Life) OS are detected.

The notification is sent **regardless of the `failOnVulnerability` setting**. This means you can receive notifications even when you don't want the deployment to fail.

```ts
const notificationTopic = new Topic(this, 'VulnerabilityNotificationTopic');

new ImageScannerWithTrivyV2(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Receive notifications for vulnerabilities and EOL detection
  vulnsNotificationTopic: notificationTopic,
  // You can choose not to fail the deployment while still receiving notifications
  failOnVulnerability: false,
});
```

You can specify an SNS topic associated with AWS Chatbot, as notifications are sent in AWS Chatbot message format.

### Rollback Error Suppression

By default, the `suppressErrorOnRollback` property is set to `true`.

When image scanning fails, CloudFormation triggers a rollback and executes the previous version
of the scanner Lambda. If this property is set to `true`, the previous version of the scanner
Lambda will not throw an error, even if the image scanning for the previous version fails.

This allows the rollback to complete successfully, avoiding ROLLBACK_FAILED state
when image scanning failures occur.

```ts
new ImageScannerWithTrivyV2(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Default is true - suppress errors during rollback to prevent ROLLBACK_FAILED
  suppressErrorOnRollback: true,
  // Set to false if you want rollback errors to be thrown
  suppressErrorOnRollback: false,
});
```

## V2 Construct

### What's changed in V2?

The `ImageScannerWithTrivyV2` construct introduces several API improvements and new features while maintaining the same core functionality:

1. **Improved API Design**
   - `exitCode` and `exitOnEol` → `failOnVulnerability` (boolean): More intuitive boolean property to control whether to fail on vulnerabilities or EOL
   - `platform` → `targetImagePlatform`: Uses the new `TargetImagePlatform` class for better type safety

2. **Improved Trivy Ignore Configuration**
   - New `TrivyIgnore` class for more flexible ignore configuration
   - Support for both inline rules (`TrivyIgnore.fromRules()`) and file paths (`TrivyIgnore.fromFilePath()`)
   - Support for both `.trivyignore` and `.trivyignore.yaml` formats

3. **Enhanced Log Management**
   - `defaultLogGroup` property for Scanner Lambda's default log group
   - Simplified log configuration by consolidating previous separate properties
   - CloudWatch Logs output now supports separate log streams for stdout and stderr

4. **New Features**
   - S3 support for scan logs output with SBOM format support (`ScanLogsOutput.s3()`)
   - SNS notification support for vulnerabilities (`vulnsNotificationTopic`): Receive notifications even when you don't want the deployment to fail by setting `failOnVulnerability: false`
   - `blockConstructs` property to automatically block dependent constructs on vulnerability detection

### Migration from V1 to V2

To migrate from V1 to V2, follow these steps:

1. **Update the import statement**:

```ts
// Before (V1)
import { ImageScannerWithTrivy } from 'image-scanner-with-trivy';

// After (V2)
import { ImageScannerWithTrivyV2 } from 'image-scanner-with-trivy';
```

1. **Update to new properties**:

```ts
// Before (V1)
new ImageScannerWithTrivy(this, 'Scanner', {
  imageUri: image.imageUri,
  repository: image.repository,
  exitCode: 1,  // or 0
  exitOnEol: 1, // or 0
  platform: 'linux/amd64',
  trivyIgnore: [
    'CVE-2021-12345',
    'CVE-2021-67890',
  ],
});

// After (V2)
new ImageScannerWithTrivyV2(this, 'Scanner', {
  imageUri: image.imageUri,
  repository: image.repository,
  failOnVulnerability: true, // or false
  // failOnEol behavior is now included in failOnVulnerability
  targetImagePlatform: TargetImagePlatform.LINUX_AMD64,
  trivyIgnore: TrivyIgnore.fromRules([
    'CVE-2021-12345',
    'CVE-2021-67890',
  ]),
});
```

1. **Update log group configuration** (if you were using custom log settings):

```ts
// Before (V1)
new ImageScannerWithTrivy(this, 'Scanner', {
  imageUri: image.imageUri,
  repository: image.repository,
  defaultLogGroupRetentionDays: RetentionDays.ONE_WEEK,
  defaultLogGroupRemovalPolicy: RemovalPolicy.DESTROY,
});

// After (V2)
// Create a custom log group with retention and removal policy
const logGroup = new LogGroup(this, 'DefaultLogGroup', {
  retention: RetentionDays.ONE_WEEK,
  removalPolicy: RemovalPolicy.DESTROY,
});

// Use `defaultLogGroup` for Scanner Lambda's default log group
new ImageScannerWithTrivyV2(this, 'Scanner', {
  imageUri: image.imageUri,
  repository: image.repository,
  defaultLogGroup: logGroup,
});
```

### Important Notes on Migration

⚠️ **CloudWatch Logs Considerations**

When you migrate from V1 to V2, the following log behavior changes occur:

1. **Different Log Group**: V2 uses a new internal Lambda function (with different UUID). As a result, **scan logs will be output to a different log group** than V1.

2. **Previous Log Group Retention**: The V1 log group behavior after migration depends on your `defaultLogGroupRemovalPolicy` setting:

```ts
// V1 construct configuration
new ImageScannerWithTrivy(this, 'Scanner', {
  imageUri: image.imageUri,
  repository: image.repository,
  defaultLogGroupRemovalPolicy: RemovalPolicy.DESTROY, // or RETAIN (default)
});
```

- If you set `RemovalPolicy.DESTROY`, the V1 log group will be deleted when you remove the V1 construct.
- If you used the **default** (`RemovalPolicy.RETAIN`), **the V1 log group will be retained** in your AWS account. You'll need to manually delete it if desired, or keep it for log history.

If you want to preserve your V1 scan logs, make sure to use `RemovalPolicy.RETAIN` or back them up before migration.

## API Reference

API Reference is [here](./API.md#api-reference-).
