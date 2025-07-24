# image-scanner-with-trivy

## Detail Pages

The detail blog is [here](https://dev.to/aws-builders/container-image-scanning-with-trivy-in-aws-cdk-151h).

To my surprise, this library was featured on the ecosystem page of [Trivy's official documentation](https://aquasecurity.github.io/trivy/latest/ecosystem/ide/#image-scanner-with-trivy-community)!

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

// Add properties you want for trivy options (ignoreUnfixed, severity, scanners, trivyIgnore, etc).
const imageScanner = new ImageScannerWithTrivy(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
});

// By adding `addDependency`, if the vulnerabilities are detected by `ImageScannerWithTrivy`, the following `ECRDeployment` will not be executed, deployment will fail.
const ecrDeployment = new ECRDeployment(this, 'DeployImage', {
  src: new DockerImageName(image.imageUri),
  dest: new DockerImageName(`${repository.repositoryUri}:latest`),
});
ecrDeployment.node.addDependency(imageScanner);
```

### Scan Logs Output

If you output the scan logs to other than the default log group, you can specify the `scanLogsOutput` option.

This option is useful when you want to choose where to output the scan logs.

Currently, CloudWatch Logs is only supported as an output destination.

```ts
import { ImageScannerWithTrivy, ScanLogsOutput } from 'image-scanner-with-trivy';

const repository = new Repository(this, 'ImageRepository', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteImages: true,
});

const image = new DockerImageAsset(this, 'DockerImage', {
  directory: resolve(__dirname, './'),
});

const imageScanner = new ImageScannerWithTrivy(this, 'ImageScannerWithTrivy', {
  imageUri: image.imageUri,
  repository: image.repository,
  // Use `ScanLogsOutput.cloudWatchLogs` method to specify the log group.
  scanLogsOutput: ScanLogsOutput.cloudWatchLogs({ logGroup: new LogGroup(this, 'LogGroup') }),
});
```

### Default Log Group

If you customize the default log group for Scanner Lambda, you can specify the `defaultLogGroupRemovalPolicy` and `defaultLogGroupRetentionDays` options.
Currently, only changing the removal policy and retention days are supported.

If the default log group is already created in your AWS Account and you specify the `defaultLogGroupRemovalPolicy` and `defaultLogGroupRetentionDays` options, the deployment will fail because of a conflict with the log group name.

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
  // Change the default log group removal policy to `Destroy`.
  defaultLogGroupRemovalPolicy: RemovalPolicy.DESTROY,
  // Change the default log group retention days to `One Year`.
  defaultLogGroupRetentionDays: RetentionDays.ONE_YEAR,
});
```

If you use ImageScannerWithTrivy construct multiple times in the same stack, you have to set the same values for `defaultLogGroupRemovalPolicy` and `defaultLogGroupRetentionDays` for each construct.
When you set the different values for each construct, the first one will be applied to all ImageScannerWithTrivy constructs in the same stack and warning message will be displayed.

The following code will produce warning message because of the different values of `defaultLogGroupRemovalPolicy` and `defaultLogGroupRetentionDays` for each construct.

```ts
import { ImageScannerWithTrivy, ScanLogsOutput } from 'image-scanner-with-trivy';

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
  // The following options are applied to all ImageScannerWithTrivy constructs in the same stack.
  defaultLogGroupRemovalPolicy: RemovalPolicy.DESTROY,
  defaultLogGroupRetentionDays: RetentionDays.ONE_YEAR,
});

// NG example
// Once you specify the defaultLogGroupRemovalPolicy and defaultLogGroupRetentionDays, you have to set the same values for each construct.
new ImageScannerWithTrivy(this, 'ImageScannerWithTrivyWithDifferentDefaultLogGroupOptions', {
  imageUri: image.imageUri,
  repository: image.repository,
  // The following options are different from the above construct, and warning message will be displayed when synthesizing the stack.
  defaultLogGroupRemovalPolicy: RemovalPolicy.RETAIN, // This should be `RemovalPolicy.DESTROY` as the above construct.
  defaultLogGroupRetentionDays: RetentionDays.ONE_MONTH, // This should be `RetentionDays.ONE_YEAR` as the above construct.
});
new ImageScannerWithTrivy(this, 'ImageScannerWithTrivyWithNoDefaultLogGroupOptions', {
  imageUri: image.imageUri,
  repository: image.repository,
  // You should specify the defaultLogGroupRemovalPolicy and defaultLogGroupRetentionDays if you have already set the values.
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

## API Reference

API Reference is [here](./API.md#api-reference-).
