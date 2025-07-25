import { join } from 'path';
import {
  Annotations,
  CfnDeletionPolicy,
  CustomResource,
  Duration,
  RemovalPolicy,
  Size,
  Stack,
  Token,
} from 'aws-cdk-lib';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { IGrantable, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  Architecture,
  AssetCode,
  Handler,
  Runtime,
  SingletonFunction,
} from 'aws-cdk-lib/aws-lambda';
import { CfnLogGroup, ILogGroup, LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import {
  CloudWatchLogsOutputOptions,
  ScanLogsOutputOptions,
  ScanLogsOutputType,
  ScannerCustomResourceProps,
} from './types';

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
 * Configuration for scan logs output to CloudWatch Logs log group.
 */
export interface CloudWatchLogsOutputProps {
  /**
   * The log group to output scan logs.
   */
  readonly logGroup: ILogGroup;
}

/**
 * Represents the output of the scan logs.
 */
export abstract class ScanLogsOutput {
  /**
   * Scan logs output to CloudWatch Logs log group.
   */
  public static cloudWatchLogs(options: CloudWatchLogsOutputProps): ScanLogsOutput {
    return new CloudWatchLogsOutput(options);
  }

  /**
   * Returns the output configuration for scan logs.
   */
  public abstract bind(grantee: IGrantable): ScanLogsOutputOptions;
}

class CloudWatchLogsOutput extends ScanLogsOutput {
  /**
   * The log group to output scan logs.
   */
  private readonly logGroup: ILogGroup;

  constructor(options: CloudWatchLogsOutputProps) {
    super();

    this.logGroup = options.logGroup;
  }

  public bind(grantee: IGrantable): CloudWatchLogsOutputOptions {
    // Most Lambdas are granted AWSLambdaBasicExecutionRole and can write to any CloudWatch Logs.
    // However, just in case AWSLambdaBasicExecutionRole is not granted, allow writing to CloudWatch Logs.
    this.logGroup.grantWrite(grantee);

    return {
      type: ScanLogsOutputType.CLOUDWATCH_LOGS,
      logGroupName: this.logGroup.logGroupName,
    };
  }
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
   * The removal policy to apply to Scanner Lambda's default log group
   *
   * If you use ImageScannerWithTrivy construct multiple times in the same stack, you cannot set different removal policies for the default log group.
   * See `Notes` section in the README for more details.
   *
   * @default - Scanner Lambda creates the default log group(`/aws/lambda/${functionName}`).
   */
  readonly defaultLogGroupRemovalPolicy?: RemovalPolicy;

  /**
   * The number of days log events are kept in Scanner Lambda's default log group
   *
   * If you use ImageScannerWithTrivy construct multiple times in the same stack, you cannot set different retention days for the default log group.
   * See `Notes` section in the README for more details.
   *
   * @default - Scanner Lambda creates the default log group(`/aws/lambda/${functionName}`) and log events never expire.
   */
  readonly defaultLogGroupRetentionDays?: RetentionDays;

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

    const lambdaPurpose = 'Custom::ImageScannerWithTrivyCustomResourceLambda';
    const customResourceLambda = new SingletonFunction(this, 'CustomResourceLambda', {
      uuid: '470b6343-d267-f753-226c-1e99f09f319a',
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

    const customResourceLambdaLogGroupConstructName = `DefaultLogGroupFor${lambdaPurpose}`;

    this.validateLambdaDefaultLogGroupOptions(customResourceLambdaLogGroupConstructName, props);

    if (props.defaultLogGroupRemovalPolicy || props.defaultLogGroupRetentionDays) {
      this.ensureLambdaDefaultLogGroup(
        customResourceLambda,
        customResourceLambdaLogGroupConstructName,
        props,
      );
    }

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
      exitCode: props.exitCode ?? 1,
      exitOnEol: props.exitOnEol ?? 1,
      trivyIgnore: props.trivyIgnore ?? [],
      platform: props.platform ?? '',
      output: props.scanLogsOutput?.bind(customResourceLambda),
      suppressErrorOnRollback: String(suppressErrorOnRollback),
    };

    new CustomResource(this, 'Resource', {
      resourceType: 'Custom::ImageScannerWithTrivy',
      properties: imageScannerProperties,
      serviceToken: imageScannerProvider.serviceToken,
    });
  }

  /**
   * Validates that specified default log group options are the same for existing default log group.
   */
  private validateLambdaDefaultLogGroupOptions(
    logGroupConstructName: string,
    props: ImageScannerWithTrivyProps,
  ): void {
    const existing = Stack.of(this).node.tryFindChild(logGroupConstructName) as
      | LogGroup
      | undefined;
    if (!existing) return;

    const cfnLogGroup = existing.node.defaultChild as CfnLogGroup;

    if (
      !this.isSameResourceDeletionBehavior(
        props.defaultLogGroupRemovalPolicy,
        cfnLogGroup.cfnOptions.deletionPolicy,
      ) ||
      cfnLogGroup.retentionInDays !== props.defaultLogGroupRetentionDays
    ) {
      Annotations.of(this).addWarningV2(
        '@image-scanner-with-trivy:duplicateLambdaDefaultLogGroupOptions',
        "You have to set the same values for 'defaultLogGroupRemovalPolicy' and 'defaultLogGroupRetentionDays' for each ImageScannerWithTrivy construct in the same stack.",
      );
    }
  }

  /**
   * Creates the default log group for Scanner Lambda if it does not exist.
   *
   * This method checks if the default log group for Scanner Lambda exists in children of the stack construct.
   * If it does not exist, it creates the default log group for Scanner Lambda as a child of the stack construct.
   */
  private ensureLambdaDefaultLogGroup(
    singletonFunction: SingletonFunction,
    logGroupConstructName: string,
    props: ImageScannerWithTrivyProps,
  ): LogGroup {
    const existing = Stack.of(this).node.tryFindChild(logGroupConstructName) as
      | LogGroup
      | undefined;
    if (existing) {
      return existing;
    }

    return new LogGroup(Stack.of(this), logGroupConstructName, {
      logGroupName: `/aws/lambda/${singletonFunction.functionName}`,
      retention: props.defaultLogGroupRetentionDays,
      removalPolicy: props.defaultLogGroupRemovalPolicy,
    });
  }

  private isSameResourceDeletionBehavior(
    removalPolicy?: RemovalPolicy,
    deletionPolicy?: CfnDeletionPolicy,
  ): boolean {
    switch (removalPolicy) {
      case RemovalPolicy.DESTROY:
        return deletionPolicy === CfnDeletionPolicy.DELETE;
      case RemovalPolicy.RETAIN:
        return deletionPolicy === CfnDeletionPolicy.RETAIN;
      case RemovalPolicy.SNAPSHOT:
        return deletionPolicy === CfnDeletionPolicy.SNAPSHOT;
      case RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE:
        return deletionPolicy === CfnDeletionPolicy.RETAIN_EXCEPT_ON_CREATE;
      case undefined:
        return deletionPolicy === undefined;
      default:
        return removalPolicy satisfies never;
    }
  }
}
