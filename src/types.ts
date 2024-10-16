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
 * Lambda function event object for Scanner Custom Resource.
 */
export interface ScannerCustomResourceProps {
  readonly addr: string;
  readonly imageUri: string;
  readonly ignoreUnfixed: string;
  readonly severity: string[];
  readonly scanners: string[];
  readonly imageConfigScanners: string[];
  readonly exitCode: number;
  readonly exitOnEol: number;
  readonly trivyIgnore: string[];
  readonly platform: string;
  readonly output?: ScanLogsOutputOptions;
}
