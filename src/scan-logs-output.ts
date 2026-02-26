import { IGrantable } from 'aws-cdk-lib/aws-iam';
import { ILogGroup } from 'aws-cdk-lib/aws-logs';
import { IBucket } from 'aws-cdk-lib/aws-s3';

/**
 * Enum for ScanLogsOutputType
 */
export enum ScanLogsOutputType {
  /**
   * Output scan logs to CloudWatch Logs.
   */
  CLOUDWATCH_LOGS = 'cloudWatchLogs',
  /**
   * Output scan logs to S3 bucket.
   */
  S3 = 's3',
}

/**
 * SBOM (Software Bill of Materials) output format for Trivy scans.
 */
export enum SbomFormat {
  /**
   * CycloneDX JSON format.
   */
  CYCLONEDX = 'cyclonedx',
  /**
   * SPDX JSON format.
   */
  SPDX_JSON = 'spdx-json',
  /**
   * SPDX Tag-Value format (human-readable).
   */
  SPDX = 'spdx',
}

/**
 * Output configurations for scan logs.
 */
export interface ScanLogsOutputOptions {
  /**
   * The type of scan logs output.
   */
  readonly type: ScanLogsOutputType;
}

/**
 * Output configuration for scan logs to CloudWatch Logs.
 */
export interface CloudWatchLogsOutputOptions extends ScanLogsOutputOptions {
  /**
   * The name of the CloudWatch Logs log group.
   */
  readonly logGroupName: string;
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
 * Output configuration for scan logs to S3 bucket.
 */
export interface S3OutputOptions extends ScanLogsOutputOptions {
  /**
   * The name of the S3 bucket.
   */
  readonly bucketName: string;
  /**
   * Optional prefix for S3 objects.
   */
  readonly prefix?: string;
  /**
   * Optional SBOM format to output in addition to scan logs.
   *
   * @default - No SBOM output
   */
  readonly sbomFormat?: SbomFormat;
}

/**
 * Configuration for scan logs output to S3 bucket.
 */
export interface S3OutputProps {
  /**
   * The S3 bucket to output scan logs.
   */
  readonly bucket: IBucket;
  /**
   * Optional prefix for S3 objects.
   */
  readonly prefix?: string;
  /**
   * Optional SBOM format to output in addition to scan logs.
   * When specified, SBOM will be generated and uploaded to S3.
   *
   * @default - No SBOM output
   */
  readonly sbomFormat?: SbomFormat;
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
   * Scan logs output to S3 bucket.
   */
  public static s3(options: S3OutputProps): ScanLogsOutput {
    return new S3Output(options);
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

class S3Output extends ScanLogsOutput {
  /**
   * The S3 bucket to output scan logs.
   */
  private readonly bucket: IBucket;
  /**
   * Optional prefix for S3 objects.
   */
  private readonly prefix?: string;
  /**
   * Optional SBOM format.
   */
  private readonly sbomFormat?: SbomFormat;

  constructor(options: S3OutputProps) {
    super();

    this.bucket = options.bucket;
    this.prefix = options.prefix;
    this.sbomFormat = options.sbomFormat;
  }

  public bind(grantee: IGrantable): S3OutputOptions {
    this.bucket.grantWrite(grantee);

    return {
      type: ScanLogsOutputType.S3,
      bucketName: this.bucket.bucketName,
      prefix: this.prefix,
      sbomFormat: this.sbomFormat,
    };
  }
}
