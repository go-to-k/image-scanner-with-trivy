import { spawnSync } from 'child_process';
import { createWriteStream } from 'fs';
import path from 'path';
import { CdkCustomResourceHandler, CdkCustomResourceResponse } from 'aws-lambda';

export const handler: CdkCustomResourceHandler = async function (event) {
  const requestType = event.RequestType;

  const addr = event.ResourceProperties.addr as string;
  const imageUri = event.ResourceProperties.imageUri as string;
  const ignoreUnfixed = event.ResourceProperties.ignoreUnfixed as string;
  const severity = event.ResourceProperties.severity as string[];
  const scanners = event.ResourceProperties.scanners as string[];
  const imageConfigScanners = event.ResourceProperties.imageConfigScanners as string[];
  const exitCode = event.ResourceProperties.exitCode as number;
  const exitOnEol = event.ResourceProperties.exitOnEol as number;
  const trivyIgnore = event.ResourceProperties.trivyIgnore as string[];
  const platform = event.ResourceProperties.platform as string;

  if (!addr || !imageUri) throw new Error('addr and imageUri are required.');

  const funcResponse: CdkCustomResourceResponse = {
    PhysicalResourceId: addr,
    Data: {} as { [key: string]: string },
  };

  if (requestType === 'Create' || requestType === 'Update') {
    const options: string[] = [];
    if (ignoreUnfixed === 'true') options.push('--ignore-unfixed');
    if (severity.length) options.push(`--severity ${severity.join(',')}`);
    if (scanners.length) options.push(`--scanners ${scanners.join(',')}`);
    if (imageConfigScanners.length)
      options.push(`--image-config-scanners ${imageConfigScanners.join(',')}`);
    if (exitCode) options.push(`--exit-code ${exitCode}`);
    if (exitOnEol) options.push(`--exit-on-eol ${exitOnEol}`);
    if (trivyIgnore.length) options.push('--ignorefile /tmp/.trivyignore');
    if (platform) options.push(`--platform ${platform}`);

    if (trivyIgnore.length) {
      console.log('trivyignore: ' + JSON.stringify(trivyIgnore));
      makeTrivyIgnoreFile(trivyIgnore);
    }

    const cmd = `/opt/trivy image --no-progress ${options.join(' ')} ${imageUri}`;
    console.log('command: ' + cmd);
    console.log('imageUri: ' + imageUri);

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

const makeTrivyIgnoreFile = (trivyIgnore: string[]) => {
  const trivyIgnoreFilePath = path.join('/tmp', '.trivyignore');
  const trivyIgnoreFile = createWriteStream(trivyIgnoreFilePath);

  trivyIgnore.forEach((line) => {
    trivyIgnoreFile.write(line + '\n');
  });

  trivyIgnoreFile.end();
};
