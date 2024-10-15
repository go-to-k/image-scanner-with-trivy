/**
 * Enum for ScanLogsOutputType
 */
export enum ScanLogsOutputType {
  CLOUDWATCH_LOGS = 'cloudWatchLogs',
}

/**
 * Output configuration for scan logs to CloudWatch Logs.
 */
export interface CloudWatchLogsOutputOptions {
  readonly type: `${ScanLogsOutputType.CLOUDWATCH_LOGS}`;
  readonly logGroupName: string;
}

/**
 * Tagged union type of output configurations for scan logs.
 *
 * TODO: add new log output destination options as they are supported
 *
 * @internal
 */
export type ScanLogsOutputOptions = CloudWatchLogsOutputOptions;

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
