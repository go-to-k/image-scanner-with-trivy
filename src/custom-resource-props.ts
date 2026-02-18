import { ScanLogsOutputOptions } from './scan-logs-output';

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
  readonly suppressErrorOnRollback: string;
}
