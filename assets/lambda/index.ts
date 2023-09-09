import { spawnSync } from 'child_process';
import { createWriteStream } from 'fs';
import path from 'path';
import { CdkCustomResourceHandler, CdkCustomResourceResponse } from 'aws-lambda';

interface ScannerProps {
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
}

export const handler: CdkCustomResourceHandler = async function (event) {
  const requestType = event.RequestType;
  const props = event.ResourceProperties as unknown as ScannerProps;

  if (!props.addr || !props.imageUri) throw new Error('addr and imageUri are required.');

  const funcResponse: CdkCustomResourceResponse = {
    PhysicalResourceId: props.addr,
    Data: {} as { [key: string]: string },
  };

  if (requestType === 'Create' || requestType === 'Update') {
    const options = makeOptions(props);

    if (props.trivyIgnore.length) {
      console.log('trivyignore: ' + JSON.stringify(props.trivyIgnore));
      makeTrivyIgnoreFile(props.trivyIgnore);
    }

    const cmd = `/opt/trivy image --no-progress ${options.join(' ')} ${props.imageUri}`;
    console.log('command: ' + cmd);
    console.log('imageUri: ' + props.imageUri);

    const response = spawnSync(cmd, {
      shell: true,
    });

    console.log('stderr:\n' + response.stderr?.toString());
    console.log('stdout:\n' + response.stdout?.toString());

    if (response.status !== 0)
      throw new Error(
        `Error: ${response.error}\nSignal: ${response.signal}\nStatus: ${response.status}\nImage Scanner returned fatal errors. You may have vulnerabilities. See logs.`,
      );
  }

  return funcResponse;
};

const makeOptions = (props: ScannerProps): string[] => {
  const options: string[] = [];

  if (props.ignoreUnfixed === 'true') options.push('--ignore-unfixed');
  if (props.severity.length) options.push(`--severity ${props.severity.join(',')}`);
  if (props.scanners.length) options.push(`--scanners ${props.scanners.join(',')}`);
  if (props.imageConfigScanners.length)
    options.push(`--image-config-scanners ${props.imageConfigScanners.join(',')}`);
  if (props.exitCode) options.push(`--exit-code ${props.exitCode}`);
  if (props.exitOnEol) options.push(`--exit-on-eol ${props.exitOnEol}`);
  if (props.trivyIgnore.length) options.push('--ignorefile /tmp/.trivyignore');
  if (props.platform) options.push(`--platform ${props.platform}`);

  return options;
};

const makeTrivyIgnoreFile = (trivyIgnore: string[]) => {
  const trivyIgnoreFilePath = path.join('/tmp', '.trivyignore');
  const trivyIgnoreFile = createWriteStream(trivyIgnoreFilePath);

  trivyIgnore.forEach((line) => {
    trivyIgnoreFile.write(line + '\n');
  });

  trivyIgnoreFile.end();
};
