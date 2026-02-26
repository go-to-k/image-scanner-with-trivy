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

    test('should include --no-progress by default', () => {
      const options = makeOptions(baseProps);
      expect(options).toContain('--no-progress');
    });

    test('should add --ignore-unfixed when ignoreUnfixed is true', () => {
      const props = { ...baseProps, ignoreUnfixed: 'true' };
      const options = makeOptions(props);
      expect(options).toContain('--ignore-unfixed');
    });

    test('should not add --ignore-unfixed when ignoreUnfixed is false', () => {
      const props = { ...baseProps, ignoreUnfixed: 'false' };
      const options = makeOptions(props);
      expect(options).not.toContain('--ignore-unfixed');
    });

    test('should add --severity when severity is provided', () => {
      const props = { ...baseProps, severity: ['CRITICAL', 'HIGH'] };
      const options = makeOptions(props);
      expect(options).toContain('--severity CRITICAL,HIGH');
    });

    test('should add --scanners when scanners is provided', () => {
      const props = { ...baseProps, scanners: ['vuln', 'secret'] };
      const options = makeOptions(props);
      expect(options).toContain('--scanners vuln,secret');
    });

    test('should add --image-config-scanners when imageConfigScanners is provided', () => {
      const props = { ...baseProps, imageConfigScanners: ['config'] };
      const options = makeOptions(props);
      expect(options).toContain('--image-config-scanners config');
    });

    test('should add --exit-code when exitCode is provided', () => {
      const props = { ...baseProps, exitCode: 1 };
      const options = makeOptions(props);
      expect(options).toContain('--exit-code 1');
    });

    test('should add --exit-on-eol when exitOnEol is provided', () => {
      const props = { ...baseProps, exitOnEol: 1 };
      const options = makeOptions(props);
      expect(options).toContain('--exit-on-eol 1');
    });

    test('should add default exit codes when exitCode is undefined (V2 mode)', () => {
      const props = { ...baseProps };
      const options = makeOptions(props);
      expect(options).toContain('--exit-code 1 --exit-on-eol 1');
    });

    test('should not add default exit codes when exitCode is defined (V1 mode)', () => {
      const props = { ...baseProps, exitCode: 1 };
      const options = makeOptions(props);
      const exitCodeOptions = options.filter((opt) => opt.includes('--exit-code'));
      expect(exitCodeOptions.length).toBe(1);
      expect(exitCodeOptions[0]).toBe('--exit-code 1');
    });

    test('should add --ignorefile with .trivyignore path when trivyIgnore is provided', () => {
      const props = { ...baseProps, trivyIgnore: ['CVE-2023-1234'] };
      const options = makeOptions(props);
      expect(options).toContain('--ignorefile /tmp/.trivyignore');
    });

    test('should add --ignorefile with .trivyignore.yaml path when trivyIgnoreFileType is TRIVYIGNORE_YAML', () => {
      const props = {
        ...baseProps,
        trivyIgnore: ['CVE-2023-1234'],
        trivyIgnoreFileType: 'TRIVYIGNORE_YAML',
      };
      const options = makeOptions(props);
      expect(options).toContain('--ignorefile /tmp/.trivyignore.yaml');
    });

    test('should add --platform when platform is provided', () => {
      const props = { ...baseProps, platform: 'linux/arm64' };
      const options = makeOptions(props);
      expect(options).toContain('--platform linux/arm64');
    });

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

    test('should add --format for SPDX format', () => {
      const props = {
        ...baseProps,
        output: {
          type: ScanLogsOutputType.S3,
          bucketName: 'test-bucket',
          sbomFormat: SbomFormat.SPDX,
        },
      };
      const options = makeOptions(props);
      expect(options).toContain('--format spdx');
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

    test('should combine multiple options correctly', () => {
      const props = {
        ...baseProps,
        ignoreUnfixed: 'true',
        severity: ['CRITICAL', 'HIGH'],
        scanners: ['vuln'],
        imageConfigScanners: ['config'],
        trivyIgnore: ['CVE-2023-1234'],
        platform: 'linux/amd64',
      };
      const options = makeOptions(props);
      expect(options).toContain('--no-progress');
      expect(options).toContain('--ignore-unfixed');
      expect(options).toContain('--severity CRITICAL,HIGH');
      expect(options).toContain('--scanners vuln');
      expect(options).toContain('--image-config-scanners config');
      expect(options).toContain('--ignorefile /tmp/.trivyignore');
      expect(options).toContain('--platform linux/amd64');
      expect(options).toContain('--exit-code 1 --exit-on-eol 1');
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

    test('should handle single CVE', () => {
      const trivyIgnore = ['CVE-2023-1234'];
      makeTrivyIgnoreFile(trivyIgnore);

      expect(existsSync(trivyIgnorePath)).toBe(true);
      const content = readFileSync(trivyIgnorePath, 'utf-8');
      expect(content).toBe('CVE-2023-1234');
    });

    test('should handle empty array', () => {
      const trivyIgnore: string[] = [];
      makeTrivyIgnoreFile(trivyIgnore);

      expect(existsSync(trivyIgnorePath)).toBe(true);
      const content = readFileSync(trivyIgnorePath, 'utf-8');
      expect(content).toBe('');
    });

    test('should handle CVEs with expiration dates', () => {
      const trivyIgnore = ['CVE-2023-1234', 'CVE-2023-5678 exp:2024-12-31'];
      makeTrivyIgnoreFile(trivyIgnore);

      expect(existsSync(trivyIgnorePath)).toBe(true);
      const content = readFileSync(trivyIgnorePath, 'utf-8');
      expect(content).toBe('CVE-2023-1234\nCVE-2023-5678 exp:2024-12-31');
    });
  });
});
