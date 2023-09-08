import { spawnSync } from 'child_process';
import { CdkCustomResourceHandler, CdkCustomResourceResponse } from 'aws-lambda';

export const handler: CdkCustomResourceHandler = async function (event) {
  const requestType = event.RequestType;

  const addr = event.ResourceProperties.addr as string;
  const imageUri = event.ResourceProperties.imageUri as string;
  const ignoreUnfixed = event.ResourceProperties.ignoreUnfixed as boolean; // TODO: boolean or string ?
  const severity = event.ResourceProperties.severity as string[];
  if (!addr || !imageUri) throw new Error('addr and imageUri are required.');

  const funcResponse: CdkCustomResourceResponse = {
    PhysicalResourceId: addr,
    Data: {} as { [key: string]: string },
  };

  if (requestType === 'Create' || requestType === 'Update') {
    const ignoreUnfixedOptions = ignoreUnfixed ? '--ignore-unfixed' : '';
    const severityOptions = severity.length ? `--severity=${severity.join(',')}` : '';
    // FIXME: Logs are interrupted in the middle.
    // --timeout in trivy?
    // spawnSync timeout?
    const response = spawnSync(
      `/opt/trivy/trivy image --no-progress --exit-code 1 ${severityOptions} ${ignoreUnfixedOptions} ${imageUri}`,
      {
        shell: true,
      },
    );

    console.log('imageUri: ' + imageUri);
    console.log('stdout:\n' + response.stdout?.toString());
    console.log('stderr:\n' + response.stderr?.toString());

    if (response.status !== 0)
      throw new Error(
        `Image Scanner returned fatal errors. You may have vulnerabilities. See logs.`,
      );
  }

  return funcResponse;
};
