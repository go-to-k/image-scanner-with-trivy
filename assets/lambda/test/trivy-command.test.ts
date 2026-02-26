import { readFileSync, existsSync, unlinkSync } from 'fs';
import { makeOptions, makeTrivyIgnoreFile } from '../lib/trivy-command';
import { ScannerCustomResourceProps } from '../../../src/custom-resource-props';
import { ScanLogsOutputType, SbomFormat } from '../../../src/scan-logs-output';

describe('trivy-command', () => {
  describe('makeOptions', () => {
    const baseProps: ScannerCustomResourceProps = {
      addr: 'test-addr',
      imageUri: 'test-image:latest',
      ignoreUnfixed: 'false',
      severity: [],
      scanners: [],
      imageConfigScanners: [],
      trivyIgnore: [],
      defaultLogGroupName: 'test-log-group',
      failOnVulnerability: 'true',
      platform: '',
      suppressErrorOnRollback: 'true',
    };

    test('should add --format when SBOM format is provided for S3 output', () => {
      const props = {
        ...baseProps,
        output: {
          type: ScanLogsOutputType.S3,
          bucketName: 'test-bucket',
          sbomFormat: SbomFormat.CYCLONEDX,
        },
      };
      const options = makeOptions(props);
      expect(options).toContain('--format cyclonedx');
    });

    test('should not add --format when SBOM format is not provided', () => {
      const props = {
        ...baseProps,
        output: {
          type: ScanLogsOutputType.S3,
          bucketName: 'test-bucket',
        },
      };
      const options = makeOptions(props);
      const formatOptions = options.filter((opt) => opt.includes('--format'));
      expect(formatOptions.length).toBe(0);
    });
  });

  describe('makeTrivyIgnoreFile', () => {
    const trivyIgnorePath = '/tmp/.trivyignore';
    const trivyIgnoreYamlPath = '/tmp/.trivyignore.yaml';

    afterEach(() => {
      // Clean up test files
      if (existsSync(trivyIgnorePath)) {
        unlinkSync(trivyIgnorePath);
      }
      if (existsSync(trivyIgnoreYamlPath)) {
        unlinkSync(trivyIgnoreYamlPath);
      }
    });

    test('should create .trivyignore file with default type', () => {
      const trivyIgnore = ['CVE-2023-1234', 'CVE-2023-5678'];
      makeTrivyIgnoreFile(trivyIgnore);

      expect(existsSync(trivyIgnorePath)).toBe(true);
      const content = readFileSync(trivyIgnorePath, 'utf-8');
      expect(content).toBe('CVE-2023-1234\nCVE-2023-5678');
    });

    test('should create .trivyignore file when fileType is not TRIVYIGNORE_YAML', () => {
      const trivyIgnore = ['CVE-2023-1234'];
      makeTrivyIgnoreFile(trivyIgnore, 'TRIVYIGNORE');

      expect(existsSync(trivyIgnorePath)).toBe(true);
      const content = readFileSync(trivyIgnorePath, 'utf-8');
      expect(content).toBe('CVE-2023-1234');
    });

    test('should create .trivyignore.yaml file when fileType is TRIVYIGNORE_YAML', () => {
      const trivyIgnore = ['CVE-2023-1234', 'CVE-2023-5678'];
      makeTrivyIgnoreFile(trivyIgnore, 'TRIVYIGNORE_YAML');

      expect(existsSync(trivyIgnoreYamlPath)).toBe(true);
      const content = readFileSync(trivyIgnoreYamlPath, 'utf-8');
      expect(content).toBe('CVE-2023-1234\nCVE-2023-5678');
    });
  });
});
