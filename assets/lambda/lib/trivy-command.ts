import { spawnSync, SpawnSyncReturns } from 'child_process';
import { writeFileSync } from 'fs';
import { ScannerCustomResourceProps } from '../../../src/custom-resource-props';
import { ScanLogsOutputType, S3OutputOptions } from '../../../src/scan-logs-output';

const TRIVY_IGNORE_FILE_PATH = '/tmp/.trivyignore';
const TRIVY_IGNORE_YAML_FILE_PATH = '/tmp/.trivyignore.yaml';

export const makeOptions = (props: ScannerCustomResourceProps): string[] => {
  const options: string[] = [];

  // Common options
  options.push('--no-progress');

  // SBOM format options
  const sbomFormat =
    props.output?.type === ScanLogsOutputType.S3
      ? (props.output as S3OutputOptions).sbomFormat
      : undefined;
  if (sbomFormat) {
    options.push(`--format ${sbomFormat}`);
  }

  // Common vulnerability scanning options
  if (props.ignoreUnfixed === 'true') options.push('--ignore-unfixed');
  if (props.severity.length) options.push(`--severity ${props.severity.join(',')}`);
  if (props.scanners.length) options.push(`--scanners ${props.scanners.join(',')}`);
  if (props.imageConfigScanners.length)
    options.push(`--image-config-scanners ${props.imageConfigScanners.join(',')}`);
  // TODO: Remove exitCode and exitOnEol properties in the next major version, as they are now controlled by failOnVulnerability.
  if (props.exitCode) options.push(`--exit-code ${props.exitCode}`);
  if (props.exitOnEol) options.push(`--exit-on-eol ${props.exitOnEol}`);
  // Always set them in V2 to ensure vulnerabilities are detected for SNS notifications, even when failOnVulnerability is false.
  // The actual deployment failure is controlled by the exit code handling logic in the handler, not by Trivy's exit code.
  if (props.exitCode == undefined) options.push('--exit-code 1 --exit-on-eol 1');
  if (props.trivyIgnore.length) {
    const ignoreFilePath =
      props.trivyIgnoreFileType === 'TRIVYIGNORE_YAML'
        ? TRIVY_IGNORE_YAML_FILE_PATH
        : TRIVY_IGNORE_FILE_PATH;
    options.push(`--ignorefile ${ignoreFilePath}`);
  }
  if (props.platform) options.push(`--platform ${props.platform}`);

  return options;
};

export const executeTrivyCommand = (imageUri: string, options: string[]): SpawnSyncReturns<Buffer> => {
  const cmd = `/opt/trivy image ${options.join(' ')} ${imageUri}`;
  console.log('imageUri: ' + imageUri);
  console.log('command: ' + cmd);
  return spawnSync(cmd, {
    shell: true,
    maxBuffer: 50 * 1024 * 1024, // 50MB (default is 1MB). SBOM output can be large and cause ENOBUFS (SIGPIPE) errors with the default buffer size.
  });
};

export const makeTrivyIgnoreFile = (trivyIgnore: string[], fileType?: string) => {
  const filePath =
    fileType === 'TRIVYIGNORE_YAML' ? TRIVY_IGNORE_YAML_FILE_PATH : TRIVY_IGNORE_FILE_PATH;
  writeFileSync(filePath, trivyIgnore.join('\n'), 'utf-8');
};
