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
 * @see https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#severity-selection
 */
export enum Severity {
  UNKNOWN = 'UNKNOWN',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Enum for Scanners
 *
 * @see https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#enabledisable-scanners
 */
export enum Scanners {
  VULN = 'vuln',
  CONFIG = 'config',
  SECRET = 'secret',
  LICENSE = 'license',
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
   * @default [Severity.CRITICAL] - It defaults to `CRITICAL` IN THIS CONSTRUCT for safety in CI/CD, but the default configuration of Trivy is "CRITICAL,HIGH,MEDIUM,LOW,UNKNOWN".
   *
   * @see https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#severity-selection
   */
  readonly severity?: Severity[];

  /**
   * Enable/Disable Scanners
   *
   * You can enable/disable scanners with the `scanners`.
   *
   * For example, container image scanning enables vulnerability (VULN) and secret scanners (SECRET) by default.
   * If you don't need secret scanning, it can be disabled by specifying Scanners.VULN only.
   *
   * @default [Scanners.VULN,Scanners.SECRET]
   *
   * @see https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#enabledisable-scanners
   */
  readonly scanners?: Scanners[];

  /**
   * Exit Code
   *
   * Use the `exitCode` option if you want to exit with a non-zero exit code.
   *
   * You can specify 0 if you do not want to exit even when vulnerabilities are detected.
   *
   * @default 1 - It defaults to 1 IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is 0.
   *
   * @see https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-code
   */
  readonly exitCode?: number;

  /**
   * Exit on EOL
   *
   * Sometimes you may surprisingly get 0 vulnerabilities in an old image:
   *  - Enabling --ignore-unfixed option while all packages have no fixed versions.
   *  - Scanning a rather outdated OS (e.g. Ubuntu 10.04).
   *
   * An OS at the end of service/life (EOL) usually gets into this situation, which is definitely full of vulnerabilities.
   * `exitOnEol` can fail scanning on EOL OS with a non-zero code.
   *
   * @default 1 - It defaults to 1 IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is 0.
   *
   * @see https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-on-eol
   */
  readonly exitOnEol?: number;
}

export class ImageScannerWithTrivy extends Construct {
  constructor(scope: Construct, id: string, props: ImageScannerWithTrivyProps) {
    super(scope, id);

    const { imageUri, repository, ignoreUnfixed, severity, scanners, exitCode, exitOnEol } = props;

    const customResourceLambda = new SingletonFunction(this, 'CustomResourceLambda', {
      uuid: '470b6343-d267-f753-226c-1e99f09f319a',
      lambdaPurpose: 'Custom::ImageScannerWithTrivyCustomResourceLambda',
      runtime: Runtime.FROM_IMAGE,
      handler: Handler.FROM_IMAGE,
      code: AssetCode.fromAssetImage(join(__dirname, '../assets/lambda')),
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(900),
      retryAttempts: 0,
      // TODO: add LargeMemory option for props?
      memorySize: 3008, // Maximum memory size for Default AWS account without quota limit increase
    });
    repository.grantPull(customResourceLambda);

    const imageScannerProvider = new Provider(this, 'Provider', {
      onEventHandler: customResourceLambda,
    });

    // TODO: parameters for .trivyignore (creating the file in Lambda, based on string array from props)
    // TODO: --platform=linux/arm64
    const imageScannerProperties: { [key: string]: string | string[] | boolean | number } = {};
    imageScannerProperties.addr = this.node.addr;
    imageScannerProperties.imageUri = imageUri;
    imageScannerProperties.ignoreUnfixed = ignoreUnfixed ?? false; // TODO: boolean or string ?
    imageScannerProperties.severity = severity ?? [Severity.CRITICAL];
    imageScannerProperties.scanners = scanners ?? [];
    imageScannerProperties.exitCode = exitCode ?? 1;
    imageScannerProperties.exitOnEol = exitOnEol ?? 1;

    new CustomResource(this, 'Default', {
      resourceType: 'Custom::ImageScannerWithTrivy',
      properties: imageScannerProperties,
      serviceToken: imageScannerProvider.serviceToken,
    });
  }
}
