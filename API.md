# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ImageScannerWithTrivy <a name="ImageScannerWithTrivy" id="image-scanner-with-trivy.ImageScannerWithTrivy"></a>

#### Initializers <a name="Initializers" id="image-scanner-with-trivy.ImageScannerWithTrivy.Initializer"></a>

```typescript
import { ImageScannerWithTrivy } from 'image-scanner-with-trivy'

new ImageScannerWithTrivy(scope: Construct, id: string, props: ImageScannerWithTrivyProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivy.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivy.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivy.Initializer.parameter.props">props</a></code> | <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps">ImageScannerWithTrivyProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="image-scanner-with-trivy.ImageScannerWithTrivy.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="image-scanner-with-trivy.ImageScannerWithTrivy.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="image-scanner-with-trivy.ImageScannerWithTrivy.Initializer.parameter.props"></a>

- *Type:* <a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps">ImageScannerWithTrivyProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivy.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="image-scanner-with-trivy.ImageScannerWithTrivy.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivy.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="image-scanner-with-trivy.ImageScannerWithTrivy.isConstruct"></a>

```typescript
import { ImageScannerWithTrivy } from 'image-scanner-with-trivy'

ImageScannerWithTrivy.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="image-scanner-with-trivy.ImageScannerWithTrivy.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivy.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="image-scanner-with-trivy.ImageScannerWithTrivy.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### CloudWatchLogsOutputOptions <a name="CloudWatchLogsOutputOptions" id="image-scanner-with-trivy.CloudWatchLogsOutputOptions"></a>

Output configuration for scan logs to CloudWatch Logs.

#### Initializer <a name="Initializer" id="image-scanner-with-trivy.CloudWatchLogsOutputOptions.Initializer"></a>

```typescript
import { CloudWatchLogsOutputOptions } from 'image-scanner-with-trivy'

const cloudWatchLogsOutputOptions: CloudWatchLogsOutputOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.CloudWatchLogsOutputOptions.property.logGroupName">logGroupName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.CloudWatchLogsOutputOptions.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `logGroupName`<sup>Required</sup> <a name="logGroupName" id="image-scanner-with-trivy.CloudWatchLogsOutputOptions.property.logGroupName"></a>

```typescript
public readonly logGroupName: string;
```

- *Type:* string

---

##### `type`<sup>Required</sup> <a name="type" id="image-scanner-with-trivy.CloudWatchLogsOutputOptions.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---

### CloudWatchLogsOutputProps <a name="CloudWatchLogsOutputProps" id="image-scanner-with-trivy.CloudWatchLogsOutputProps"></a>

Configuration for scan logs output to CloudWatch Logs log group.

#### Initializer <a name="Initializer" id="image-scanner-with-trivy.CloudWatchLogsOutputProps.Initializer"></a>

```typescript
import { CloudWatchLogsOutputProps } from 'image-scanner-with-trivy'

const cloudWatchLogsOutputProps: CloudWatchLogsOutputProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.CloudWatchLogsOutputProps.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group to output scan logs. |

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="image-scanner-with-trivy.CloudWatchLogsOutputProps.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The log group to output scan logs.

---

### ImageScannerWithTrivyProps <a name="ImageScannerWithTrivyProps" id="image-scanner-with-trivy.ImageScannerWithTrivyProps"></a>

#### Initializer <a name="Initializer" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.Initializer"></a>

```typescript
import { ImageScannerWithTrivyProps } from 'image-scanner-with-trivy'

const imageScannerWithTrivyProps: ImageScannerWithTrivyProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.imageUri">imageUri</a></code> | <code>string</code> | Image URI for scan target. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.repository">repository</a></code> | <code>aws-cdk-lib.aws_ecr.IRepository</code> | Repository including the image URI for scan target. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.exitCode">exitCode</a></code> | <code>number</code> | Exit Code. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.exitOnEol">exitOnEol</a></code> | <code>number</code> | Exit on EOL. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.ignoreUnfixed">ignoreUnfixed</a></code> | <code>boolean</code> | The unfixed/unfixable vulnerabilities mean that the patch has not yet been provided on their distribution. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.imageConfigScanners">imageConfigScanners</a></code> | <code><a href="#image-scanner-with-trivy.ImageConfigScanners">ImageConfigScanners</a>[]</code> | Enum for ImageConfigScanners. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.memorySize">memorySize</a></code> | <code>number</code> | Memory Size (MB) for Scanner Lambda. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.platform">platform</a></code> | <code>string</code> | Scan Image on a specific Architecture and OS. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.scanLogsOutput">scanLogsOutput</a></code> | <code><a href="#image-scanner-with-trivy.ScanLogsOutput">ScanLogsOutput</a></code> | Configuration for scan logs output. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.scanners">scanners</a></code> | <code><a href="#image-scanner-with-trivy.Scanners">Scanners</a>[]</code> | Enable/Disable Scanners. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.severity">severity</a></code> | <code><a href="#image-scanner-with-trivy.Severity">Severity</a>[]</code> | Severity Selection. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.trivyIgnore">trivyIgnore</a></code> | <code>string[]</code> | By Finding IDs. |

---

##### `imageUri`<sup>Required</sup> <a name="imageUri" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.imageUri"></a>

```typescript
public readonly imageUri: string;
```

- *Type:* string

Image URI for scan target.

---

##### `repository`<sup>Required</sup> <a name="repository" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.repository"></a>

```typescript
public readonly repository: IRepository;
```

- *Type:* aws-cdk-lib.aws_ecr.IRepository

Repository including the image URI for scan target.

Because of grantPull to CustomResourceLambda.

---

##### `exitCode`<sup>Optional</sup> <a name="exitCode" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.exitCode"></a>

```typescript
public readonly exitCode: number;
```

- *Type:* number
- *Default:* 1

Exit Code.

Use the `exitCode` option if you want to exit with a non-zero exit code.

You can specify 0 if you do not want to exit even when vulnerabilities are detected.

It defaults to 1 IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is 0.

> [https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-code](https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-code)

---

##### `exitOnEol`<sup>Optional</sup> <a name="exitOnEol" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.exitOnEol"></a>

```typescript
public readonly exitOnEol: number;
```

- *Type:* number
- *Default:* 1

Exit on EOL.

Sometimes you may surprisingly get 0 vulnerabilities in an old image:
 - Enabling --ignore-unfixed option while all packages have no fixed versions.
 - Scanning a rather outdated OS (e.g. Ubuntu 10.04).

An OS at the end of service/life (EOL) usually gets into this situation, which is definitely full of vulnerabilities.
`exitOnEol` can fail scanning on EOL OS with a non-zero code.

It defaults to 1 IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is 0.

> [https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-on-eol](https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-on-eol)

---

##### `ignoreUnfixed`<sup>Optional</sup> <a name="ignoreUnfixed" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.ignoreUnfixed"></a>

```typescript
public readonly ignoreUnfixed: boolean;
```

- *Type:* boolean
- *Default:* false

The unfixed/unfixable vulnerabilities mean that the patch has not yet been provided on their distribution.

To hide unfixed/unfixable vulnerabilities, you can use the `--ignore-unfixed` flag.

> [https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#unfixed-vulnerabilities](https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#unfixed-vulnerabilities)

---

##### `imageConfigScanners`<sup>Optional</sup> <a name="imageConfigScanners" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.imageConfigScanners"></a>

```typescript
public readonly imageConfigScanners: ImageConfigScanners[];
```

- *Type:* <a href="#image-scanner-with-trivy.ImageConfigScanners">ImageConfigScanners</a>[]
- *Default:* []

Enum for ImageConfigScanners.

Container images have configuration. docker inspect and `docker history` show the information according to the configuration.
Trivy scans the configuration of container images for

- Misconfigurations
- Secrets

They are disabled by default. You can enable them with `imageConfigScanners`.

> [https://aquasecurity.github.io/trivy/latest/docs/target/container_image/#container-image-metadata](https://aquasecurity.github.io/trivy/latest/docs/target/container_image/#container-image-metadata)

---

##### `memorySize`<sup>Optional</sup> <a name="memorySize" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.memorySize"></a>

```typescript
public readonly memorySize: number;
```

- *Type:* number
- *Default:* 3008

Memory Size (MB) for Scanner Lambda.

You can specify between `3008` and `10240`.

If this Construct execution terminates abnormally due to SIGKILL, try a larger size.

Default value (`3008` MB) is Maximum Lambda memory size for default AWS account without quota limit increase.

---

##### `platform`<sup>Optional</sup> <a name="platform" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.platform"></a>

```typescript
public readonly platform: string;
```

- *Type:* string
- *Default:* 

Scan Image on a specific Architecture and OS.

By default, Trivy loads an image on a `linux/amd64` machine.

To customize this, pass a `platform` argument in the format OS/Architecture for the image, such as `linux/arm64`

---

##### `scanLogsOutput`<sup>Optional</sup> <a name="scanLogsOutput" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.scanLogsOutput"></a>

```typescript
public readonly scanLogsOutput: ScanLogsOutput;
```

- *Type:* <a href="#image-scanner-with-trivy.ScanLogsOutput">ScanLogsOutput</a>
- *Default:* scan logs output to default log group created by Scanner Lambda(`/aws/lambda/${functionName}`)

Configuration for scan logs output.

By default, scan logs are output to default log group created by Scanner Lambda.

Specify this if you want to send scan logs to other than the default log group.

Currently, only `cloudWatchLogs` is supported.

---

##### `scanners`<sup>Optional</sup> <a name="scanners" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.scanners"></a>

```typescript
public readonly scanners: Scanners[];
```

- *Type:* <a href="#image-scanner-with-trivy.Scanners">Scanners</a>[]
- *Default:* [Security.VULN,Scanners.SECRET]

Enable/Disable Scanners.

You can enable/disable scanners with the `scanners`.

For example, container image scanning enables vulnerability (VULN) and secret scanners (SECRET) by default.
If you don't need secret scanning, it can be disabled by specifying Scanners.VULN only.

> [https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#enabledisable-scanners](https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#enabledisable-scanners)

---

##### `severity`<sup>Optional</sup> <a name="severity" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.severity"></a>

```typescript
public readonly severity: Severity[];
```

- *Type:* <a href="#image-scanner-with-trivy.Severity">Severity</a>[]
- *Default:* [Severity.CRITICAL]

Severity Selection.

The severity is taken from the selected data source since the severity from vendors is more accurate.
Using CVE-2023-0464 as an example, while it is rated as "HIGH" in NVD, Red Hat has marked its 'Impact' as "Low". As a result, Trivy will display it as "Low".

The severity depends on the compile option, the default configuration, etc. NVD doesn't know how the vendor distributes the software.
Red Hat evaluates the severity more accurately. That's why Trivy prefers vendor scores over NVD.

It defaults to `CRITICAL` IN THIS CONSTRUCT for safety in CI/CD, but the default configuration of Trivy is "CRITICAL,HIGH,MEDIUM,LOW,UNKNOWN".

> [https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#severity-selection](https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#severity-selection)

---

##### `trivyIgnore`<sup>Optional</sup> <a name="trivyIgnore" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.trivyIgnore"></a>

```typescript
public readonly trivyIgnore: string[];
```

- *Type:* string[]
- *Default:* []

By Finding IDs.

The ignore rules written to the .trivyignore in trivy.
Put each line you write in the file into one element of the array.

> [https://aquasecurity.github.io/trivy/latest/docs/configuration/filtering/#trivyignore](https://aquasecurity.github.io/trivy/latest/docs/configuration/filtering/#trivyignore)

---

*Example*

```typescript
    $ cat .trivyignore
    # Accept the risk
    CVE-2018-14618

    # Accept the risk until 2023-01-01
    CVE-2019-14697 exp:2023-01-01

    # No impact in our settings
    CVE-2019-1543

    # Ignore misconfigurations
    AVD-DS-0002

    # Ignore secrets
    generic-unwanted-rule
    aws-account-id
```


### ScannerCustomResourceProps <a name="ScannerCustomResourceProps" id="image-scanner-with-trivy.ScannerCustomResourceProps"></a>

Lambda function event object for Scanner Custom Resource.

#### Initializer <a name="Initializer" id="image-scanner-with-trivy.ScannerCustomResourceProps.Initializer"></a>

```typescript
import { ScannerCustomResourceProps } from 'image-scanner-with-trivy'

const scannerCustomResourceProps: ScannerCustomResourceProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.addr">addr</a></code> | <code>string</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.exitCode">exitCode</a></code> | <code>number</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.exitOnEol">exitOnEol</a></code> | <code>number</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.ignoreUnfixed">ignoreUnfixed</a></code> | <code>string</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.imageConfigScanners">imageConfigScanners</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.imageUri">imageUri</a></code> | <code>string</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.platform">platform</a></code> | <code>string</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.scanners">scanners</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.severity">severity</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.trivyIgnore">trivyIgnore</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ScannerCustomResourceProps.property.output">output</a></code> | <code><a href="#image-scanner-with-trivy.CloudWatchLogsOutputOptions">CloudWatchLogsOutputOptions</a></code> | *No description.* |

---

##### `addr`<sup>Required</sup> <a name="addr" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.addr"></a>

```typescript
public readonly addr: string;
```

- *Type:* string

---

##### `exitCode`<sup>Required</sup> <a name="exitCode" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.exitCode"></a>

```typescript
public readonly exitCode: number;
```

- *Type:* number

---

##### `exitOnEol`<sup>Required</sup> <a name="exitOnEol" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.exitOnEol"></a>

```typescript
public readonly exitOnEol: number;
```

- *Type:* number

---

##### `ignoreUnfixed`<sup>Required</sup> <a name="ignoreUnfixed" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.ignoreUnfixed"></a>

```typescript
public readonly ignoreUnfixed: string;
```

- *Type:* string

---

##### `imageConfigScanners`<sup>Required</sup> <a name="imageConfigScanners" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.imageConfigScanners"></a>

```typescript
public readonly imageConfigScanners: string[];
```

- *Type:* string[]

---

##### `imageUri`<sup>Required</sup> <a name="imageUri" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.imageUri"></a>

```typescript
public readonly imageUri: string;
```

- *Type:* string

---

##### `platform`<sup>Required</sup> <a name="platform" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.platform"></a>

```typescript
public readonly platform: string;
```

- *Type:* string

---

##### `scanners`<sup>Required</sup> <a name="scanners" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.scanners"></a>

```typescript
public readonly scanners: string[];
```

- *Type:* string[]

---

##### `severity`<sup>Required</sup> <a name="severity" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.severity"></a>

```typescript
public readonly severity: string[];
```

- *Type:* string[]

---

##### `trivyIgnore`<sup>Required</sup> <a name="trivyIgnore" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.trivyIgnore"></a>

```typescript
public readonly trivyIgnore: string[];
```

- *Type:* string[]

---

##### `output`<sup>Optional</sup> <a name="output" id="image-scanner-with-trivy.ScannerCustomResourceProps.property.output"></a>

```typescript
public readonly output: CloudWatchLogsOutputOptions;
```

- *Type:* <a href="#image-scanner-with-trivy.CloudWatchLogsOutputOptions">CloudWatchLogsOutputOptions</a>

---

## Classes <a name="Classes" id="Classes"></a>

### ScanLogsOutput <a name="ScanLogsOutput" id="image-scanner-with-trivy.ScanLogsOutput"></a>

Represents the output of the scan logs.

#### Initializers <a name="Initializers" id="image-scanner-with-trivy.ScanLogsOutput.Initializer"></a>

```typescript
import { ScanLogsOutput } from 'image-scanner-with-trivy'

new ScanLogsOutput()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.ScanLogsOutput.bind">bind</a></code> | Returns the output configuration for scan logs. |

---

##### `bind` <a name="bind" id="image-scanner-with-trivy.ScanLogsOutput.bind"></a>

```typescript
public bind(grantee: IGrantable): CloudWatchLogsOutputOptions
```

Returns the output configuration for scan logs.

###### `grantee`<sup>Required</sup> <a name="grantee" id="image-scanner-with-trivy.ScanLogsOutput.bind.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.ScanLogsOutput.cloudWatchLogs">cloudWatchLogs</a></code> | Scan logs output to CloudWatch Logs log group. |

---

##### `cloudWatchLogs` <a name="cloudWatchLogs" id="image-scanner-with-trivy.ScanLogsOutput.cloudWatchLogs"></a>

```typescript
import { ScanLogsOutput } from 'image-scanner-with-trivy'

ScanLogsOutput.cloudWatchLogs(options: CloudWatchLogsOutputProps)
```

Scan logs output to CloudWatch Logs log group.

###### `options`<sup>Required</sup> <a name="options" id="image-scanner-with-trivy.ScanLogsOutput.cloudWatchLogs.parameter.options"></a>

- *Type:* <a href="#image-scanner-with-trivy.CloudWatchLogsOutputProps">CloudWatchLogsOutputProps</a>

---




## Enums <a name="Enums" id="Enums"></a>

### ImageConfigScanners <a name="ImageConfigScanners" id="image-scanner-with-trivy.ImageConfigScanners"></a>

Enum for ImageConfigScanners.

> [https://aquasecurity.github.io/trivy/latest/docs/target/container_image/#container-image-metadata](https://aquasecurity.github.io/trivy/latest/docs/target/container_image/#container-image-metadata)

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageConfigScanners.CONFIG">CONFIG</a></code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ImageConfigScanners.SECRET">SECRET</a></code> | *No description.* |

---

##### `CONFIG` <a name="CONFIG" id="image-scanner-with-trivy.ImageConfigScanners.CONFIG"></a>

---


##### `SECRET` <a name="SECRET" id="image-scanner-with-trivy.ImageConfigScanners.SECRET"></a>

---


### ScanLogsOutputType <a name="ScanLogsOutputType" id="image-scanner-with-trivy.ScanLogsOutputType"></a>

Enum for ScanLogsOutputType.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.ScanLogsOutputType.CLOUDWATCH_LOGS">CLOUDWATCH_LOGS</a></code> | *No description.* |

---

##### `CLOUDWATCH_LOGS` <a name="CLOUDWATCH_LOGS" id="image-scanner-with-trivy.ScanLogsOutputType.CLOUDWATCH_LOGS"></a>

---


### Scanners <a name="Scanners" id="image-scanner-with-trivy.Scanners"></a>

Enum for Scanners.

> [https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#enabledisable-scanners](https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#enabledisable-scanners)

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.Scanners.VULN">VULN</a></code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.Scanners.CONFIG">CONFIG</a></code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.Scanners.SECRET">SECRET</a></code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.Scanners.LICENSE">LICENSE</a></code> | *No description.* |

---

##### `VULN` <a name="VULN" id="image-scanner-with-trivy.Scanners.VULN"></a>

---


##### `CONFIG` <a name="CONFIG" id="image-scanner-with-trivy.Scanners.CONFIG"></a>

---


##### `SECRET` <a name="SECRET" id="image-scanner-with-trivy.Scanners.SECRET"></a>

---


##### `LICENSE` <a name="LICENSE" id="image-scanner-with-trivy.Scanners.LICENSE"></a>

---


### Severity <a name="Severity" id="image-scanner-with-trivy.Severity"></a>

Enum for Severity Selection.

> [https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#severity-selection](https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#severity-selection)

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.Severity.UNKNOWN">UNKNOWN</a></code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.Severity.LOW">LOW</a></code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.Severity.MEDIUM">MEDIUM</a></code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.Severity.HIGH">HIGH</a></code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.Severity.CRITICAL">CRITICAL</a></code> | *No description.* |

---

##### `UNKNOWN` <a name="UNKNOWN" id="image-scanner-with-trivy.Severity.UNKNOWN"></a>

---


##### `LOW` <a name="LOW" id="image-scanner-with-trivy.Severity.LOW"></a>

---


##### `MEDIUM` <a name="MEDIUM" id="image-scanner-with-trivy.Severity.MEDIUM"></a>

---


##### `HIGH` <a name="HIGH" id="image-scanner-with-trivy.Severity.HIGH"></a>

---


##### `CRITICAL` <a name="CRITICAL" id="image-scanner-with-trivy.Severity.CRITICAL"></a>

---

