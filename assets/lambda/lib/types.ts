export interface CloudWatchLogsDetails {
  type: 'cloudwatch';
  logGroupName: string;
  logStreamName: string;
}

export interface CloudWatchLogsV2Details {
  type: 'cloudwatch-v2';
  logGroupName: string;
  stdoutLogStreamName: string;
  stderrLogStreamName: string;
}

export interface S3LogsDetails {
  type: 's3';
  bucketName: string;
  stderrKey: string;
  stdoutKey: string;
}

export interface S3SbomLogsDetails {
  type: 's3-sbom';
  bucketName: string;
  stderrKey: string;
  sbomKey: string;
  sbomFormat: string;
}

export interface DefaultLogsDetails {
  type: 'default';
  logGroupName: string;
}

export type ScanLogsDetails =
  | CloudWatchLogsDetails
  | CloudWatchLogsV2Details
  | S3LogsDetails
  | S3SbomLogsDetails
  | DefaultLogsDetails;
