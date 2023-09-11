# image-scanner-with-trivy

## What is

This is an AWS CDK Construct that allows you to **scan container images with Trivy in CDK deployment layer**.

If it detects vulnerabilities, it can **prevent the image from being pushed to the ECR for the application**.

Since it takes an `imageUri` for ECR as an argument, it can also be used to **simply scan an existing image in the repository**.

## Trivy

[Trivy](https://github.com/aquasecurity/trivy) is a comprehensive and versatile security scanner.

## Usage

- Install

```sh
npm install image-scanner-with-trivy
```

- CDK Code

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

## API Reference

API Reference is [here](./API.md#api-reference-).
