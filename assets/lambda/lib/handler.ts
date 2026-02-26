import { SpawnSyncReturns } from 'child_process';
import { CdkCustomResourceHandler, CdkCustomResourceResponse } from 'aws-lambda';
import { ScannerCustomResourceProps } from '../../../src/custom-resource-props';
import { ScanLogsOutputOptions, ScanLogsOutputType, CloudWatchLogsOutputOptions, S3OutputOptions } from '../../../src/scan-logs-output';
import { makeOptions, executeTrivyCommand, makeTrivyIgnoreFile } from './trivy-command';
import { outputScanLogsToCWLogs, outputScanLogsToCWLogsV2 } from './cloudwatch-logs';
import { outputScanLogsToS3 } from './s3-output';
import { sendVulnsNotification } from './sns-notification';
import { isRollbackInProgress } from './cloudformation-utils';

export const handler: CdkCustomResourceHandler = async function (event) {
  const requestType = event.RequestType;
  const props = event.ResourceProperties as unknown as ScannerCustomResourceProps;

  if (!props.addr || !props.imageUri) throw new Error('addr and imageUri are required.');

  const funcResponse: CdkCustomResourceResponse = {
    PhysicalResourceId: props.addr,
    Data: {} as { [key: string]: string },
  };

  if (requestType !== 'Create' && requestType !== 'Update') {
    return funcResponse;
  }

  if (props.trivyIgnore.length) {
    console.log('trivyignore: ' + JSON.stringify(props.trivyIgnore));
    makeTrivyIgnoreFile(props.trivyIgnore, props.trivyIgnoreFileType);
  }

  const options = makeOptions(props);
  const response = executeTrivyCommand(props.imageUri, options);

  await outputScanLogs(response, props.imageUri, props.exitCode == undefined, props.output);

  if (response.status === 0) {
    return funcResponse;
  }

  const status =
    response.status === 1
      ? 'vulnerabilities or end-of-life (EOL) image detected'
      : `unexpected exit code ${response.status}`;
  const errorMessage = `Error: ${response.error}\nSignal: ${response.signal}\nStatus: ${status}\nImage Scanner returned fatal errors. You may have vulnerabilities. See logs.`;

  if (props.vulnsTopicArn) {
    await sendVulnsNotification(
      props.vulnsTopicArn,
      errorMessage,
      props.imageUri,
      props.defaultLogGroupName,
      props.output,
    );
  }

  if (props.failOnVulnerability === 'false') {
    return funcResponse;
  }

  if (props.suppressErrorOnRollback === 'true' && (await isRollbackInProgress(event.StackId))) {
    console.log(
      `Vulnerabilities may be detected, but suppressing errors during rollback (suppressErrorOnRollback=true).\n${errorMessage}`,
    );
    return funcResponse;
  }

  throw new Error(errorMessage);
};

const outputScanLogs = async (
  response: SpawnSyncReturns<Buffer>,
  imageUri: string,
  isV2: boolean, // TODO: Remove this in the next major version
  output?: ScanLogsOutputOptions,
) => {
  switch (output?.type) {
    case ScanLogsOutputType.CLOUDWATCH_LOGS:
      if (isV2) {
        await outputScanLogsToCWLogsV2(response, output as CloudWatchLogsOutputOptions, imageUri);
      } else {
        await outputScanLogsToCWLogs(response, output as CloudWatchLogsOutputOptions, imageUri);
      }
      break;
    case ScanLogsOutputType.S3:
      await outputScanLogsToS3(response, output as S3OutputOptions, imageUri);
      break;
    default:
      // Scan logs output to lambda default log group
      console.log('stderr:\n' + response.stderr.toString());
      console.log('stdout:\n' + response.stdout.toString());
  }
};
