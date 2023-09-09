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
  const exitCode = event.ResourceProperties.exitCode as number;
  const exitOnEol = event.ResourceProperties.exitOnEol as number;
  const trivyIgnore = event.ResourceProperties.trivyIgnore as string[];

  if (!addr || !imageUri) throw new Error('addr and imageUri are required.');

  const funcResponse: CdkCustomResourceResponse = {
    PhysicalResourceId: addr,
    Data: {} as { [key: string]: string },
  };

  if (requestType === 'Create' || requestType === 'Update') {
    const ignoreUnfixedOptions = ignoreUnfixed === 'true' ? '--ignore-unfixed' : '';
    const severityOptions = severity.length ? `--severity ${severity.join(',')}` : '';
    const scannersOptions = scanners.length ? `--scanners ${scanners.join(',')}` : '';
    const exitCodeOptions = exitCode ? `--exit-code ${exitCode}` : '';
    const exitOnEolOptions = exitOnEol ? `--exit-on-eol ${exitOnEol}` : '';
    const trivyIgnoreOptions = trivyIgnore.length ? '--ignorefile /tmp/.trivyignore' : '';

    if (trivyIgnore.length) {
      console.log('trivyignore: ' + JSON.stringify(trivyIgnore));
      makeTrivyIgnoreFile(trivyIgnore);
    }

    const cmd = `/opt/trivy image --no-progress ${exitCodeOptions} ${exitOnEolOptions} ${severityOptions} ${scannersOptions} ${ignoreUnfixedOptions} ${trivyIgnoreOptions} ${imageUri}`;
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
