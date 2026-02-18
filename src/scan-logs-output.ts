import { IGrantable } from 'aws-cdk-lib/aws-iam';
import { ILogGroup } from 'aws-cdk-lib/aws-logs';

/**
 * Enum for ScanLogsOutputType
 */
export enum ScanLogsOutputType {
  CLOUDWATCH_LOGS = 'cloudWatchLogs',
}

/**
 * Output configurations for scan logs.
 */
export interface ScanLogsOutputOptions {
  readonly type: ScanLogsOutputType;
}

/**
 * Output configuration for scan logs to CloudWatch Logs.
 */
export interface CloudWatchLogsOutputOptions extends ScanLogsOutputOptions {
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
