import { join } from 'path';
import { CustomResource, Duration } from 'aws-cdk-lib';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import {
  Architecture,
  AssetCode,
  Handler,
  Runtime,
  SingletonFunction,
} from 'aws-cdk-lib/aws-lambda';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

/**
 * Enum for Severity Selection
 *
 * @see https://aquasecurity.github.io/trivy/v0.45/docs/scanner/vulnerability/#severity-selection
 */
export enum Severity {
  UNKNOWN = 'UNKNOWN',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ImageScannerWithTrivyProps {
  /**
   * Image URI for scan target.
   */
  readonly imageUri: string;

  /**
   * Repository including the image URI for scan target.
   *
   * Because of grantPull to CustomResourceLambda.
   */
  readonly repository: IRepository;

  /**
   * The unfixed/unfixable vulnerabilities mean that the patch has not yet been provided on their distribution.
   *
   * To hide unfixed/unfixable vulnerabilities, you can use the `--ignore-unfixed` flag.
   *
   * @see https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#unfixed-vulnerabilities
   */
  readonly ignoreUnfixed?: boolean;

  /**
   * Severity Selection
   *
   * The severity is taken from the selected data source since the severity from vendors is more accurate.
   * Using CVE-2023-0464 as an example, while it is rated as "HIGH" in NVD, Red Hat has marked its 'Impact' as "Low". As a result, Trivy will display it as "Low".
   *
   * The severity depends on the compile option, the default configuration, etc. NVD doesn't know how the vendor distributes the software.
   * Red Hat evaluates the severity more accurately. That's why Trivy prefers vendor scores over NVD.
   *
   * @default [] - The default configuration of Trivy is "CRITICAL,HIGH,MEDIUM,LOW,UNKNOWN".
   *
   * @see https://aquasecurity.github.io/trivy/v0.45/docs/scanner/vulnerability/#severity-selection
   */
  readonly severity?: Severity[];
}

export class ImageScannerWithTrivy extends Construct {
  constructor(scope: Construct, id: string, props: ImageScannerWithTrivyProps) {
    super(scope, id);

    const { imageUri, repository, ignoreUnfixed, severity } = props;

    const customResourceLambda = new SingletonFunction(this, 'CustomResourceLambda', {
      uuid: '470b6343-d267-f753-226c-1e99f09f319a',
      lambdaPurpose: 'Custom::ImageScannerWithTrivyCustomResourceLambda',
      runtime: Runtime.FROM_IMAGE,
      handler: Handler.FROM_IMAGE,
      code: AssetCode.fromAssetImage(join(__dirname, '../assets/lambda')),
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(900),
      retryAttempts: 0,
      memorySize: 3008, // Maximum memory size for Default AWS account
    });
    repository.grantPull(customResourceLambda);

    const imageScannerProvider = new Provider(this, 'Provider', {
      onEventHandler: customResourceLambda,
    });

    const imageScannerProperties: { [key: string]: string | string[] | boolean } = {};
    imageScannerProperties.addr = this.node.addr;
    imageScannerProperties.imageUri = imageUri;
    imageScannerProperties.ignoreUnfixed = ignoreUnfixed ?? false; // TODO: boolean or string ?
    imageScannerProperties.severity = severity ?? [];

    new CustomResource(this, 'Default', {
      resourceType: 'Custom::ImageScannerWithTrivy',
      properties: imageScannerProperties,
      serviceToken: imageScannerProvider.serviceToken,
    });
  }
}
