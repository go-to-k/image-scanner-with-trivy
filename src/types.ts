/**
 * Output configuration for scan logs to CloudWatch Logs.
 */
export interface CloudWatchLogsOutput {
  type: 'cloudWatchLogs';
  logGroupName: string;
}

/**
 * Tagged union type of output configurations for scan logs.
 */
export type ScanLogsOutputOptions = CloudWatchLogsOutput;

/**
 * Lambda function event object for Scanner Custom Resource.
 */
export interface ScannerCustomResourceProps {
  addr: string;
  imageUri: string;
  ignoreUnfixed: string;
  severity: string[];
  scanners: string[];
  imageConfigScanners: string[];
  exitCode: number;
  exitOnEol: number;
  trivyIgnore: string[];
  platform: string;
  output?: ScanLogsOutputOptions;
}
