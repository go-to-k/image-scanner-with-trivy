import { readFileSync } from 'fs';
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
import { ITopic } from 'aws-cdk-lib/aws-sns';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { ScannerCustomResourceProps } from './custom-resource-props';
import { ScanLogsOutput } from './scan-logs-output';
import { Severity, Scanners, ImageConfigScanners } from './types';

/**
 * File type for TrivyIgnore file path
 */
export enum TrivyIgnoreFileType {
  /**
   * .trivyignore file
   *
   * @see https://trivy.dev/docs/latest/configuration/filtering/#trivyignore
   */
  TRIVYIGNORE = 'TRIVYIGNORE',

  /**
   * .trivyignore.yaml file
   *
   * @see https://trivy.dev/docs/latest/configuration/filtering/#trivyignoreyaml
   */
  TRIVYIGNORE_YAML = 'TRIVYIGNORE_YAML',
}

/**
 * Union-like class for specifying Trivy ignore configuration.
 *
 * You can either specify ignore rules inline, or point to an existing ignore file.
 */
export class TrivyIgnore {
  /**
   * Specify ignore rules inline (equivalent to writing lines in a .trivyignore file).
   *
   * @param rules Each element corresponds to one line in the .trivyignore file.
   *
   * @see https://trivy.dev/docs/latest/configuration/filtering/#trivyignore
   */
  public static fromRules(rules: string[]): TrivyIgnore {
    return new TrivyIgnore(rules);
  }

  /**
   * Specify the path to an existing trivyignore file.
   *
   * @param path Path to the ignore file.
   * @param fileType File format. Defaults to `TrivyIgnoreFileType.TRIVYIGNORE`.
   *
   * @see https://trivy.dev/docs/latest/configuration/filtering/#trivyignore
   * @see https://trivy.dev/docs/latest/configuration/filtering/#trivyignoreyaml
   */
  public static fromFilePath(
    path: string,
    fileType: TrivyIgnoreFileType = TrivyIgnoreFileType.TRIVYIGNORE,
  ): TrivyIgnore {
    const content = readFileSync(path, 'utf-8');
    // Pass lines as-is without stripping comments or empty lines
    // because Trivy itself handles comment lines (starting with `#`) and empty lines when reading the ignore file.
    return new TrivyIgnore(content.split('\n'), fileType);
  }

  private constructor(
    public readonly rules: string[],
    public readonly fileType?: TrivyIgnoreFileType,
  ) {}
}

/**
 * Enum for Target Image Platform
 */
export class TargetImagePlatform {
  /**
   * Linux AMD64 platform
   */
  public static readonly LINUX_AMD64 = new TargetImagePlatform('linux/amd64');

  /**
   * Linux ARM64 platform
   */
  public static readonly LINUX_ARM64 = new TargetImagePlatform('linux/arm64');

  /**
   * Custom value for target image platform
   *
   * The value should be in the format OS/Architecture for the image, such as `linux/arm64`.
   */
  public static custom(value: string): TargetImagePlatform {
    return new TargetImagePlatform(value);
  }

  private constructor(public readonly value: string) {}
}

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
   * Whether to fail on vulnerabilities or EOL (End of Life) images
   *
   * If set to `true`, Trivy exits with a non-zero exit code when vulnerabilities or EOL images are detected.
   *
   * If set to `false`, Trivy exits with a zero exit code even when vulnerabilities or EOL images are detected.
   *
   * It defaults to `true` IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is `false` (exit code 0).
   *
   * @default true
   *
   * @see https://trivy.dev/docs/latest/configuration/others/#exit-code
   */
  readonly failOnVulnerability?: boolean;

  /**
   * Ignore rules or ignore file for Trivy.
   *
   * Use `TrivyIgnore.fromRules()` to specify inline ignore rules (equivalent to writing lines
   * in a `.trivyignore` file), or `TrivyIgnore.fromFilePath()` to point to an existing ignore file.
   *
   * @default - no ignore rules
   *
   * @see https://trivy.dev/docs/latest/configuration/filtering/#trivyignore
   * @see https://trivy.dev/docs/latest/configuration/filtering/#trivyignoreyaml
   */
  readonly trivyIgnore?: TrivyIgnore;

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
   * @default - Trivy loads an image on a `linux/amd64` machine.
   */
  readonly targetImagePlatform?: TargetImagePlatform;

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

  /**
   * SNS topic for vulnerabilities notification
   *
   * If specified, an SNS topic notification will be sent when vulnerabilities or EOL (End of Life) OS are detected.
   *
   * The notification is sent regardless of the `failOnVulnerability` setting.
   * This means you can choose to receive notifications even when you don't want the deployment to fail.
   *
   * You can specify an SNS topic associated with AWS Chatbot, as notifications are sent in AWS Chatbot message format.
   *
   * @default - no notification
   */
  readonly vulnsNotificationTopic?: ITopic;
}

// Maximum Lambda memory size for default AWS account without quota limit increase
const DEFAULT_MEMORY_SIZE = 3008;

/**
 * A Construct that scans container images with Trivy.
 * It uses a Lambda function as a Custom Resource provider to run Trivy and scan container images.
 */
export class ImageScannerWithTrivyV2 extends Construct {
  private readonly defaultLogGroup?: ILogGroup;

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

    if (props.vulnsNotificationTopic) {
      props.vulnsNotificationTopic.grantPublish(customResourceLambda);
    }

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
          node._defaultLogGroup?.node.path !== this.defaultLogGroup?.node.path
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
      failOnVulnerability: String(props.failOnVulnerability ?? true),
      trivyIgnore: props.trivyIgnore?.rules ?? [],
      trivyIgnoreFileType: props.trivyIgnore?.fileType,
      platform: props.targetImagePlatform?.value ?? '',
      output: props.scanLogsOutput?.bind(customResourceLambda),
      suppressErrorOnRollback: String(suppressErrorOnRollback),
      vulnsTopicArn: props.vulnsNotificationTopic?.topicArn,
    };

    new CustomResource(this, 'Resource', {
      resourceType: 'Custom::ImageScannerWithTrivyV2',
      properties: imageScannerProperties,
      serviceToken: imageScannerProvider.serviceToken,
    });
  }

  /** @internal */
  get _defaultLogGroup(): ILogGroup | undefined {
    return this.defaultLogGroup;
  }
}
