/**
 * Enum for Severity Selection
 *
 * @see https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#severity-selection
 */
export enum Severity {
  UNKNOWN = 'UNKNOWN',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Enum for Scanners
 *
 * @see https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#enabledisable-scanners
 */
export enum Scanners {
  VULN = 'vuln',
  CONFIG = 'config',
  SECRET = 'secret',
  LICENSE = 'license',
}

/**
 * Enum for ImageConfigScanners
 *
 * @see https://aquasecurity.github.io/trivy/latest/docs/target/container_image/#container-image-metadata
 */
export enum ImageConfigScanners {
  CONFIG = 'config',
  SECRET = 'secret',
}
