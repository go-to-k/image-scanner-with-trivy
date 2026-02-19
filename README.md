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

## Trivy's official documentation

To my surprise, this library was featured on the ecosystem page of [Trivy's official documentation](https://trivy.dev/docs/latest/ecosystem/ide/#image-scanner-with-trivy-community)!

## API Reference

API Reference is [here](./API.md#api-reference-).
