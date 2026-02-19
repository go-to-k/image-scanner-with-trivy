import { join } from 'path';
import { Annotations, Aspects, CustomResource, Duration, Size, Stack, Token } from 'aws-cdk-lib';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
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
import { ScannerCustomResourceProps } from './custom-resource-props';
import { ScanLogsOutput } from './scan-logs-output';
import { Severity, Scanners, ImageConfigScanners } from './types';

/**
 * Properties for ImageScannerWithTrivyV2 Construct.
 */
export interface ImageScannerWithTrivyV2Props {
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
   * @see https://trivy.dev/docs/latest/scanner/vulnerability/#unfixed-vulnerabilities
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
   * @see https://trivy.dev/docs/latest/scanner/vulnerability/#severity-selection
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
   * @see https://trivy.dev/docs/latest/configuration/others/#enabledisable-scanners
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
   * @see https://trivy.dev/docs/latest/target/container_image/#container-image-metadata
   */
  readonly imageConfigScanners?: ImageConfigScanners[];

  /**
   * Exit Code
   *
   * If set to `true`, Trivy exits with a non-zero exit code when vulnerabilities are detected.
   *
   * If set to `false`, Trivy exits with a zero exit code even when vulnerabilities are detected.
   *
   * It defaults to `true` IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is `false` (exit code 0).
   *
   * @default true
   *
   * @see https://trivy.dev/docs/latest/configuration/others/#exit-code
   */
  readonly failOnVulnerability?: boolean;

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
   * @see https://trivy.dev/docs/latest/configuration/others/#exit-on-eol
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
   * @see https://trivy.dev/docs/latest/configuration/filtering/#trivyignore
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
   * The Scanner Lambda function's default log group
   *
   * If you use ImageScannerWithTrivyV2 construct multiple times in the same stack,
   * you must specify the same log group for each construct.
   *
   * See `Default Log Group` section in the README for more details.
   *
   * @default - Scanner Lambda creates the default log group(`/aws/lambda/${functionName}`).
   */
  readonly defaultLogGroup?: ILogGroup;

  /**
   * Configuration for scan logs output
   *
   * By default, scan logs are output to default log group created by Scanner Lambda.
   *
   * Specify this if you want to send scan logs to other than the default log group.
   *
   * Currently, only `cloudWatchLogs` is supported.
   *
   * @default - scan logs output to `defaultLogGroup` if specified, otherwise to the default
   * log group created by Scanner Lambda.
   */
  readonly scanLogsOutput?: ScanLogsOutput;

  /**
   * Suppress errors during rollback scanner Lambda execution
   *
   * When image scanning fails, CloudFormation triggers a rollback and executes the previous
   * version of the scanner Lambda. If this property is set to `true`, the previous version of
   * the scanner Lambda will not throw an error, even if the image scanning for the previous version
   * fails.
   *
   * This allows the rollback to complete successfully, avoiding ROLLBACK_FAILED state
   * when image scanning failures occur.
   *
   * @default true
   */
  readonly suppressErrorOnRollback?: boolean;
}

// Maximum Lambda memory size for default AWS account without quota limit increase
const DEFAULT_MEMORY_SIZE = 3008;

/**
 * A Construct that scans container images with Trivy.
 * It uses a Lambda function as a Custom Resource provider to run Trivy and scan container images.
 */
export class ImageScannerWithTrivyV2 extends Construct {
  /**
   * The default log group for the singleton Lambda function
   */
  public readonly defaultLogGroup?: ILogGroup;

  constructor(scope: Construct, id: string, props: ImageScannerWithTrivyV2Props) {
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

    this.defaultLogGroup = props.defaultLogGroup;
    const lambdaPurpose = 'Custom::ImageScannerWithTrivyV2CustomResourceLambda';

    const customResourceLambda = new SingletonFunction(this, 'CustomResourceLambda', {
      uuid: 'cc3b41b5-4701-d86f-fe24-3a04f4a573f1',
      lambdaPurpose,
      runtime: Runtime.FROM_IMAGE,
      handler: Handler.FROM_IMAGE,
      code: AssetCode.fromAssetImage(join(__dirname, '../assets/lambda'), {
        platform: Platform.LINUX_ARM64,
        // exclude node_modules
        // because the native binary of the installed esbuild changes depending on the cpu architecture
        // and the hash value of the image asset changes depending on the execution environment.
        exclude: ['node_modules'],
      }),
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(900),
      retryAttempts: 0,
      memorySize: props.memorySize ?? DEFAULT_MEMORY_SIZE,
      ephemeralStorageSize: Size.gibibytes(10), // for cases that need to update trivy DB: /tmp/trivy/db/trivy.db
      logGroup: this.defaultLogGroup,
    });

    props.repository.grantPull(customResourceLambda);

    // Grant CloudFormation DescribeStacks permission for rollback detection when suppressErrorOnRollback is enabled
    const suppressErrorOnRollback = props.suppressErrorOnRollback ?? true;
    if (suppressErrorOnRollback) {
      customResourceLambda.addToRolePolicy(
        new PolicyStatement({
          actions: ['cloudformation:DescribeStacks'],
          resources: [Stack.of(this).stackId],
        }),
      );
    }

    // If multiple ImageScannerWithTrivyV2 constructs in the same stack have different default log groups, add a warning annotation.
    Aspects.of(Stack.of(this)).add({
      visit: (node) => {
        if (
          node instanceof ImageScannerWithTrivyV2 &&
          node.defaultLogGroup?.node.path !== this.defaultLogGroup?.node.path
        ) {
          Annotations.of(this).addWarningV2(
            '@image-scanner-with-trivy:duplicateLambdaDefaultLogGroup',
            "You have to set the same log group for 'defaultLogGroup' for each ImageScannerWithTrivyV2 construct in the same stack.",
          );
        }
      },
    });

    const imageScannerProvider = new Provider(this, 'Provider', {
      onEventHandler: customResourceLambda,
    });

    const imageScannerProperties: ScannerCustomResourceProps = {
      addr: this.node.addr,
      imageUri: props.imageUri,
      ignoreUnfixed: String(props.ignoreUnfixed ?? false),
      severity: props.severity ?? [Severity.CRITICAL],
      scanners: props.scanners ?? [],
      imageConfigScanners: props.imageConfigScanners ?? [],
      exitCode: (props.failOnVulnerability ?? true) ? 1 : 0,
      exitOnEol: props.exitOnEol ?? 1,
      trivyIgnore: props.trivyIgnore ?? [],
      platform: props.platform ?? '',
      output: props.scanLogsOutput?.bind(customResourceLambda),
      suppressErrorOnRollback: String(suppressErrorOnRollback),
    };

    new CustomResource(this, 'Resource', {
      resourceType: 'Custom::ImageScannerWithTrivyV2',
      properties: imageScannerProperties,
      serviceToken: imageScannerProvider.serviceToken,
    });
  }
}
