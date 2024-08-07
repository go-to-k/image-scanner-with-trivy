import { join } from 'path';
import { CustomResource, Duration, Size, Token } from 'aws-cdk-lib';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import {
  Architecture,
  AssetCode,
  Handler,
  Runtime,
  SingletonFunction,
} from 'aws-cdk-lib/aws-lambda';
import { ILogGroup } from 'aws-cdk-lib/aws-logs';
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

/**
 * Enum for ImageConfigScanners
 *
 * @see https://aquasecurity.github.io/trivy/latest/docs/target/container_image/#container-image-metadata
 */
export enum ImageConfigScanners {
  CONFIG = 'config',
  SECRET = 'secret',
}

/**
 * Represents the output of the scan logs.
 */
export abstract class ScanLogsOutput {
  /**
   * Scan logs output to CloudWatch Logs log group.
   */
  public static cloudWatchLogs(logGroup: ILogGroup): ScanLogsOutput {
    return {
      type: 'cloudWatchLogs',
      logGroupName: logGroup.logGroupName,
    };
  }

  /**
   * The type of the scan logs output.
   */
  public abstract readonly type: 'cloudWatchLogs';

  /**
   * The name of the logGroup.
   */
  public abstract readonly logGroupName?: string;
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
   * @default false
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
   * It defaults to `CRITICAL` IN THIS CONSTRUCT for safety in CI/CD, but the default configuration of Trivy is "CRITICAL,HIGH,MEDIUM,LOW,UNKNOWN".
   *
   * @default [Severity.CRITICAL]
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
   * @default [Security.VULN,Scanners.SECRET]
   *
   * @see https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#enabledisable-scanners
   */
  readonly scanners?: Scanners[];

  /**
   * Enum for ImageConfigScanners
   *
   * Container images have configuration. docker inspect and `docker history` show the information according to the configuration.
   * Trivy scans the configuration of container images for
   *
   * - Misconfigurations
   * - Secrets
   *
   * They are disabled by default. You can enable them with `imageConfigScanners`.
   *
   * @default []
   *
   * @see https://aquasecurity.github.io/trivy/latest/docs/target/container_image/#container-image-metadata
   */
  readonly imageConfigScanners?: ImageConfigScanners[];

  /**
   * Exit Code
   *
   * Use the `exitCode` option if you want to exit with a non-zero exit code.
   *
   * You can specify 0 if you do not want to exit even when vulnerabilities are detected.
   *
   * It defaults to 1 IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is 0.
   *
   * @default 1
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
   * It defaults to 1 IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is 0.
   *
   * @default 1
   *
   * @see https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-on-eol
   */
  readonly exitOnEol?: number;

  /**
   * By Finding IDs
   *
   * The ignore rules written to the .trivyignore in trivy.
   * Put each line you write in the file into one element of the array.
   *
   * @example
   *     $ cat .trivyignore
   *     # Accept the risk
   *     CVE-2018-14618
   *
   *     # Accept the risk until 2023-01-01
   *     CVE-2019-14697 exp:2023-01-01
   *
   *     # No impact in our settings
   *     CVE-2019-1543
   *
   *     # Ignore misconfigurations
   *     AVD-DS-0002
   *
   *     # Ignore secrets
   *     generic-unwanted-rule
   *     aws-account-id
   *
   * @default []
   *
   * @see https://aquasecurity.github.io/trivy/latest/docs/configuration/filtering/#trivyignore
   */
  readonly trivyIgnore?: string[];

  /**
   * Memory Size (MB) for Scanner Lambda
   *
   * You can specify between `3008` and `10240`.
   *
   * If this Construct execution terminates abnormally due to SIGKILL, try a larger size.
   *
   * Default value (`3008` MB) is Maximum Lambda memory size for default AWS account without quota limit increase.
   *
   * @default 3008
   */
  readonly memorySize?: number;

  /**
   * Scan Image on a specific Architecture and OS
   *
   * By default, Trivy loads an image on a `linux/amd64` machine.
   *
   * To customize this, pass a `platform` argument in the format OS/Architecture for the image, such as `linux/arm64`
   *
   * @default -
   */
  readonly platform?: string;

  /**
   * Configuration for scan logs output
   *
   * By default, scan logs are output to default log group created by Scanner Lambda.
   *
   * Specify this if you want to send scan logs to other than the default log group.
   *
   * Currently, only `cloudWatchLogs` is supported.
   *
   * @default - scan logs output to default log group created by Scanner Lambda(`/aws/lambda/${functionName}`)
   */
  readonly scanLogsOutput?: ScanLogsOutput;
}

// Maximum Lambda memory size for default AWS account without quota limit increase
const DEFAULT_MEMORY_SIZE = 3008;

export class ImageScannerWithTrivy extends Construct {
  constructor(scope: Construct, id: string, props: ImageScannerWithTrivyProps) {
    super(scope, id);

    if (
      props.memorySize &&
      !Token.isUnresolved(props.memorySize) &&
      (props.memorySize < 3008 || props.memorySize > 10240)
    ) {
      throw new Error(
        `You can specify between \`3008\` and \`10240\` for \`memorySize\`, got ${props.memorySize}.`,
      );
    }

    const customResourceLambda = new SingletonFunction(this, 'CustomResourceLambda', {
      uuid: '470b6343-d267-f753-226c-1e99f09f319a',
      lambdaPurpose: 'Custom::ImageScannerWithTrivyCustomResourceLambda',
      runtime: Runtime.FROM_IMAGE,
      handler: Handler.FROM_IMAGE,
      code: AssetCode.fromAssetImage(join(__dirname, '../assets/lambda'), {
        platform: Platform.LINUX_ARM64,
      }),
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(900),
      retryAttempts: 0,
      memorySize: props.memorySize ?? DEFAULT_MEMORY_SIZE,
      ephemeralStorageSize: Size.gibibytes(10), // for cases that need to update trivy DB: /tmp/trivy/db/trivy.db
    });
    props.repository.grantPull(customResourceLambda);

    const imageScannerProvider = new Provider(this, 'Provider', {
      onEventHandler: customResourceLambda,
    });

    const imageScannerProperties: {
      [key: string]: string | string[] | boolean | number | ScanLogsOutput;
    } = {};
    imageScannerProperties.addr = this.node.addr;
    imageScannerProperties.imageUri = props.imageUri;
    imageScannerProperties.ignoreUnfixed = props.ignoreUnfixed ?? false;
    imageScannerProperties.severity = props.severity ?? [Severity.CRITICAL];
    imageScannerProperties.scanners = props.scanners ?? [];
    imageScannerProperties.imageConfigScanners = props.imageConfigScanners ?? [];
    imageScannerProperties.exitCode = props.exitCode ?? 1;
    imageScannerProperties.exitOnEol = props.exitOnEol ?? 1;
    imageScannerProperties.trivyIgnore = props.trivyIgnore ?? [];
    imageScannerProperties.platform = props.platform ?? '';

    if (props.scanLogsOutput) {
      imageScannerProperties.output = props.scanLogsOutput;
    }

    new CustomResource(this, 'Resource', {
      resourceType: 'Custom::ImageScannerWithTrivy',
      properties: imageScannerProperties,
      serviceToken: imageScannerProvider.serviceToken,
    });
  }
}
