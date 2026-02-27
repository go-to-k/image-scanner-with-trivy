# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ImageScannerWithTrivy <a name="ImageScannerWithTrivy" id="image-scanner-with-trivy.ImageScannerWithTrivy"></a>

A Construct that scans container images with Trivy.

It uses a Lambda function as a Custom Resource provider to run Trivy and scan container images.

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

##### ~~`toString`~~ <a name="toString" id="image-scanner-with-trivy.ImageScannerWithTrivy.toString"></a>

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

##### ~~`node`~~<sup>Required</sup> <a name="node" id="image-scanner-with-trivy.ImageScannerWithTrivy.property.node"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2 instead. This will be removed in the next major version.

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### ImageScannerWithTrivyV2 <a name="ImageScannerWithTrivyV2" id="image-scanner-with-trivy.ImageScannerWithTrivyV2"></a>

A Construct that scans container images with Trivy.

It uses a Lambda function as a Custom Resource provider to run Trivy and scan container images.

#### Initializers <a name="Initializers" id="image-scanner-with-trivy.ImageScannerWithTrivyV2.Initializer"></a>

```typescript
import { ImageScannerWithTrivyV2 } from 'image-scanner-with-trivy'

new ImageScannerWithTrivyV2(scope: Construct, id: string, props: ImageScannerWithTrivyV2Props)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2.Initializer.parameter.props">props</a></code> | <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props">ImageScannerWithTrivyV2Props</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="image-scanner-with-trivy.ImageScannerWithTrivyV2.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="image-scanner-with-trivy.ImageScannerWithTrivyV2.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="image-scanner-with-trivy.ImageScannerWithTrivyV2.Initializer.parameter.props"></a>

- *Type:* <a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props">ImageScannerWithTrivyV2Props</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="image-scanner-with-trivy.ImageScannerWithTrivyV2.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="image-scanner-with-trivy.ImageScannerWithTrivyV2.isConstruct"></a>

```typescript
import { ImageScannerWithTrivyV2 } from 'image-scanner-with-trivy'

ImageScannerWithTrivyV2.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="image-scanner-with-trivy.ImageScannerWithTrivyV2.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="image-scanner-with-trivy.ImageScannerWithTrivyV2.property.node"></a>

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
| <code><a href="#image-scanner-with-trivy.CloudWatchLogsOutputOptions.property.type">type</a></code> | <code><a href="#image-scanner-with-trivy.ScanLogsOutputType">ScanLogsOutputType</a></code> | The type of scan logs output. |
| <code><a href="#image-scanner-with-trivy.CloudWatchLogsOutputOptions.property.logGroupName">logGroupName</a></code> | <code>string</code> | The name of the CloudWatch Logs log group. |

---

##### `type`<sup>Required</sup> <a name="type" id="image-scanner-with-trivy.CloudWatchLogsOutputOptions.property.type"></a>

```typescript
public readonly type: ScanLogsOutputType;
```

- *Type:* <a href="#image-scanner-with-trivy.ScanLogsOutputType">ScanLogsOutputType</a>

The type of scan logs output.

---

##### `logGroupName`<sup>Required</sup> <a name="logGroupName" id="image-scanner-with-trivy.CloudWatchLogsOutputOptions.property.logGroupName"></a>

```typescript
public readonly logGroupName: string;
```

- *Type:* string

The name of the CloudWatch Logs log group.

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

Properties for ImageScannerWithTrivy Construct.

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
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.defaultLogGroupRemovalPolicy">defaultLogGroupRemovalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | The removal policy to apply to Scanner Lambda's default log group. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.defaultLogGroupRetentionDays">defaultLogGroupRetentionDays</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in Scanner Lambda's default log group. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.exitCode">exitCode</a></code> | <code>number</code> | Exit Code. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.exitOnEol">exitOnEol</a></code> | <code>number</code> | Exit on EOL. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.ignoreUnfixed">ignoreUnfixed</a></code> | <code>boolean</code> | The unfixed/unfixable vulnerabilities mean that the patch has not yet been provided on their distribution. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.imageConfigScanners">imageConfigScanners</a></code> | <code><a href="#image-scanner-with-trivy.ImageConfigScanners">ImageConfigScanners</a>[]</code> | Enum for ImageConfigScanners. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.memorySize">memorySize</a></code> | <code>number</code> | Memory Size (MB) for Scanner Lambda. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.platform">platform</a></code> | <code>string</code> | Scan Image on a specific Architecture and OS. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.scanLogsOutput">scanLogsOutput</a></code> | <code><a href="#image-scanner-with-trivy.ScanLogsOutput">ScanLogsOutput</a></code> | Configuration for scan logs output. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.scanners">scanners</a></code> | <code><a href="#image-scanner-with-trivy.Scanners">Scanners</a>[]</code> | Enable/Disable Scanners. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.severity">severity</a></code> | <code><a href="#image-scanner-with-trivy.Severity">Severity</a>[]</code> | Severity Selection. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.suppressErrorOnRollback">suppressErrorOnRollback</a></code> | <code>boolean</code> | Suppress errors during rollback scanner Lambda execution. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.trivyIgnore">trivyIgnore</a></code> | <code>string[]</code> | By Finding IDs. |

---

##### ~~`imageUri`~~<sup>Required</sup> <a name="imageUri" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.imageUri"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

```typescript
public readonly imageUri: string;
```

- *Type:* string

Image URI for scan target.

---

##### ~~`repository`~~<sup>Required</sup> <a name="repository" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.repository"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

```typescript
public readonly repository: IRepository;
```

- *Type:* aws-cdk-lib.aws_ecr.IRepository

Repository including the image URI for scan target.

Because of grantPull to CustomResourceLambda.

---

##### ~~`defaultLogGroupRemovalPolicy`~~<sup>Optional</sup> <a name="defaultLogGroupRemovalPolicy" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.defaultLogGroupRemovalPolicy"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

```typescript
public readonly defaultLogGroupRemovalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* Scanner Lambda creates the default log group(`/aws/lambda/${functionName}`).

The removal policy to apply to Scanner Lambda's default log group.

If you use ImageScannerWithTrivy construct multiple times in the same stack, you cannot set different removal policies for the default log group.
See `Notes` section in the README for more details.

---

##### ~~`defaultLogGroupRetentionDays`~~<sup>Optional</sup> <a name="defaultLogGroupRetentionDays" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.defaultLogGroupRetentionDays"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

```typescript
public readonly defaultLogGroupRetentionDays: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* Scanner Lambda creates the default log group(`/aws/lambda/${functionName}`) and log events never expire.

The number of days log events are kept in Scanner Lambda's default log group.

If you use ImageScannerWithTrivy construct multiple times in the same stack, you cannot set different retention days for the default log group.
See `Notes` section in the README for more details.

---

##### ~~`exitCode`~~<sup>Optional</sup> <a name="exitCode" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.exitCode"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

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

##### ~~`exitOnEol`~~<sup>Optional</sup> <a name="exitOnEol" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.exitOnEol"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

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

##### ~~`ignoreUnfixed`~~<sup>Optional</sup> <a name="ignoreUnfixed" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.ignoreUnfixed"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

```typescript
public readonly ignoreUnfixed: boolean;
```

- *Type:* boolean
- *Default:* false

The unfixed/unfixable vulnerabilities mean that the patch has not yet been provided on their distribution.

To hide unfixed/unfixable vulnerabilities, you can use the `--ignore-unfixed` flag.

> [https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#unfixed-vulnerabilities](https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#unfixed-vulnerabilities)

---

##### ~~`imageConfigScanners`~~<sup>Optional</sup> <a name="imageConfigScanners" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.imageConfigScanners"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

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

##### ~~`memorySize`~~<sup>Optional</sup> <a name="memorySize" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.memorySize"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

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

##### ~~`platform`~~<sup>Optional</sup> <a name="platform" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.platform"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

```typescript
public readonly platform: string;
```

- *Type:* string
- *Default:* 

Scan Image on a specific Architecture and OS.

By default, Trivy loads an image on a `linux/amd64` machine.

To customize this, pass a `platform` argument in the format OS/Architecture for the image, such as `linux/arm64`

---

##### ~~`scanLogsOutput`~~<sup>Optional</sup> <a name="scanLogsOutput" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.scanLogsOutput"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

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

##### ~~`scanners`~~<sup>Optional</sup> <a name="scanners" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.scanners"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

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

##### ~~`severity`~~<sup>Optional</sup> <a name="severity" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.severity"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

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

##### ~~`suppressErrorOnRollback`~~<sup>Optional</sup> <a name="suppressErrorOnRollback" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.suppressErrorOnRollback"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

```typescript
public readonly suppressErrorOnRollback: boolean;
```

- *Type:* boolean
- *Default:* true

Suppress errors during rollback scanner Lambda execution.

When image scanning fails, CloudFormation triggers a rollback and executes the previous
version of the scanner Lambda. If this property is set to `true`, the previous version of
the scanner Lambda will not throw an error, even if the image scanning for the previous version
fails.

This allows the rollback to complete successfully, avoiding ROLLBACK_FAILED state
when image scanning failures occur.

---

##### ~~`trivyIgnore`~~<sup>Optional</sup> <a name="trivyIgnore" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.trivyIgnore"></a>

- *Deprecated:* Use ImageScannerWithTrivyV2Props instead. This will be removed in the next major version.

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


### ImageScannerWithTrivyV2Props <a name="ImageScannerWithTrivyV2Props" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props"></a>

Properties for ImageScannerWithTrivyV2 Construct.

#### Initializer <a name="Initializer" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.Initializer"></a>

```typescript
import { ImageScannerWithTrivyV2Props } from 'image-scanner-with-trivy'

const imageScannerWithTrivyV2Props: ImageScannerWithTrivyV2Props = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.imageUri">imageUri</a></code> | <code>string</code> | Image URI for scan target. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.repository">repository</a></code> | <code>aws-cdk-lib.aws_ecr.IRepository</code> | Repository including the image URI for scan target. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.blockConstructs">blockConstructs</a></code> | <code>constructs.IConstruct[]</code> | Constructs to block if vulnerabilities are detected. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.defaultLogGroup">defaultLogGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The Scanner Lambda function's default log group. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.failOnVulnerability">failOnVulnerability</a></code> | <code>boolean</code> | Whether to fail on vulnerabilities or EOL (End of Life) images. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.ignoreUnfixed">ignoreUnfixed</a></code> | <code>boolean</code> | The unfixed/unfixable vulnerabilities mean that the patch has not yet been provided on their distribution. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.imageConfigScanners">imageConfigScanners</a></code> | <code><a href="#image-scanner-with-trivy.ImageConfigScanners">ImageConfigScanners</a>[]</code> | Enum for ImageConfigScanners. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.memorySize">memorySize</a></code> | <code>number</code> | Memory Size (MB) for Scanner Lambda. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.scanLogsOutput">scanLogsOutput</a></code> | <code><a href="#image-scanner-with-trivy.ScanLogsOutput">ScanLogsOutput</a></code> | Configuration for scan logs output. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.scanners">scanners</a></code> | <code><a href="#image-scanner-with-trivy.Scanners">Scanners</a>[]</code> | Enable/Disable Scanners. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.severity">severity</a></code> | <code><a href="#image-scanner-with-trivy.Severity">Severity</a>[]</code> | Severity Selection. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.suppressErrorOnRollback">suppressErrorOnRollback</a></code> | <code>boolean</code> | Suppress errors during rollback scanner Lambda execution. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.targetImagePlatform">targetImagePlatform</a></code> | <code><a href="#image-scanner-with-trivy.TargetImagePlatform">TargetImagePlatform</a></code> | Scan Image on a specific Architecture and OS. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.trivyIgnore">trivyIgnore</a></code> | <code><a href="#image-scanner-with-trivy.TrivyIgnore">TrivyIgnore</a></code> | Ignore rules or ignore file for Trivy. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.vulnsNotificationTopic">vulnsNotificationTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | SNS topic for vulnerabilities notification. |

---

##### `imageUri`<sup>Required</sup> <a name="imageUri" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.imageUri"></a>

```typescript
public readonly imageUri: string;
```

- *Type:* string

Image URI for scan target.

---

##### `repository`<sup>Required</sup> <a name="repository" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.repository"></a>

```typescript
public readonly repository: IRepository;
```

- *Type:* aws-cdk-lib.aws_ecr.IRepository

Repository including the image URI for scan target.

Because of grantPull to CustomResourceLambda.

---

##### `blockConstructs`<sup>Optional</sup> <a name="blockConstructs" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.blockConstructs"></a>

```typescript
public readonly blockConstructs: IConstruct[];
```

- *Type:* constructs.IConstruct[]
- *Default:* no constructs to block

Constructs to block if vulnerabilities are detected.

This is equivalent to calling `construct.node.addDependency(imageScanner)` for each construct.

Note: This option only works when `failOnVulnerability` is `true` (default).
If `failOnVulnerability` is set to `false`, the scanner will not fail on vulnerabilities,
and the specified constructs will not be blocked.

---

##### `defaultLogGroup`<sup>Optional</sup> <a name="defaultLogGroup" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.defaultLogGroup"></a>

```typescript
public readonly defaultLogGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* Scanner Lambda creates the default log group(`/aws/lambda/${functionName}`).

The Scanner Lambda function's default log group.

If you use ImageScannerWithTrivyV2 construct multiple times in the same stack,
you must specify the same log group for each construct.

See `Default Log Group` section in the README for more details.

---

##### `failOnVulnerability`<sup>Optional</sup> <a name="failOnVulnerability" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.failOnVulnerability"></a>

```typescript
public readonly failOnVulnerability: boolean;
```

- *Type:* boolean
- *Default:* true

Whether to fail on vulnerabilities or EOL (End of Life) images.

If set to `true`, Trivy exits with a non-zero exit code when vulnerabilities or EOL images are detected.

If set to `false`, Trivy exits with a zero exit code even when vulnerabilities or EOL images are detected.

It defaults to `true` IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is `false` (exit code 0).

**Note**: When `sbomFormat` is specified in `scanLogsOutput.s3()`, SBOM generation mode is used instead of
vulnerability scanning. In SBOM mode, Trivy always exits with code 0 regardless of this setting, and
no SNS notifications will be sent even if `vulnsNotificationTopic` is configured.

> [https://trivy.dev/docs/latest/configuration/others/#exit-code](https://trivy.dev/docs/latest/configuration/others/#exit-code)

---

##### `ignoreUnfixed`<sup>Optional</sup> <a name="ignoreUnfixed" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.ignoreUnfixed"></a>

```typescript
public readonly ignoreUnfixed: boolean;
```

- *Type:* boolean
- *Default:* false

The unfixed/unfixable vulnerabilities mean that the patch has not yet been provided on their distribution.

To hide unfixed/unfixable vulnerabilities, you can use the `--ignore-unfixed` flag.

> [https://trivy.dev/docs/latest/scanner/vulnerability/#unfixed-vulnerabilities](https://trivy.dev/docs/latest/scanner/vulnerability/#unfixed-vulnerabilities)

---

##### `imageConfigScanners`<sup>Optional</sup> <a name="imageConfigScanners" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.imageConfigScanners"></a>

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

> [https://trivy.dev/docs/latest/target/container_image/#container-image-metadata](https://trivy.dev/docs/latest/target/container_image/#container-image-metadata)

---

##### `memorySize`<sup>Optional</sup> <a name="memorySize" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.memorySize"></a>

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

##### `scanLogsOutput`<sup>Optional</sup> <a name="scanLogsOutput" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.scanLogsOutput"></a>

```typescript
public readonly scanLogsOutput: ScanLogsOutput;
```

- *Type:* <a href="#image-scanner-with-trivy.ScanLogsOutput">ScanLogsOutput</a>
- *Default:* scan logs output to `defaultLogGroup` if specified, otherwise to the default log group created by Scanner Lambda.

Configuration for scan logs output.

By default, scan logs are output to default log group created by Scanner Lambda.

Specify this if you want to send scan logs to other than the default log group.

**Note**: CloudWatch Logs has a 1 MB per log event limit. Large scan results will be
automatically split into multiple events with `[part X/Y]` prefixes. **For large scan
results, we recommend using S3 output** to avoid fragmentation and make it easier to
view complete results.

---

##### `scanners`<sup>Optional</sup> <a name="scanners" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.scanners"></a>

```typescript
public readonly scanners: Scanners[];
```

- *Type:* <a href="#image-scanner-with-trivy.Scanners">Scanners</a>[]
- *Default:* [Security.VULN,Scanners.SECRET]

Enable/Disable Scanners.

You can enable/disable scanners with the `scanners`.

For example, container image scanning enables vulnerability (VULN) and secret scanners (SECRET) by default.
If you don't need secret scanning, it can be disabled by specifying Scanners.VULN only.

> [https://trivy.dev/docs/latest/configuration/others/#enabledisable-scanners](https://trivy.dev/docs/latest/configuration/others/#enabledisable-scanners)

---

##### `severity`<sup>Optional</sup> <a name="severity" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.severity"></a>

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

> [https://trivy.dev/docs/latest/scanner/vulnerability/#severity-selection](https://trivy.dev/docs/latest/scanner/vulnerability/#severity-selection)

---

##### `suppressErrorOnRollback`<sup>Optional</sup> <a name="suppressErrorOnRollback" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.suppressErrorOnRollback"></a>

```typescript
public readonly suppressErrorOnRollback: boolean;
```

- *Type:* boolean
- *Default:* true

Suppress errors during rollback scanner Lambda execution.

When image scanning fails, CloudFormation triggers a rollback and executes the previous
version of the scanner Lambda. If this property is set to `true`, the previous version of
the scanner Lambda will not throw an error, even if the image scanning for the previous version
fails.

This allows the rollback to complete successfully, avoiding ROLLBACK_FAILED state
when image scanning failures occur.

---

##### `targetImagePlatform`<sup>Optional</sup> <a name="targetImagePlatform" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.targetImagePlatform"></a>

```typescript
public readonly targetImagePlatform: TargetImagePlatform;
```

- *Type:* <a href="#image-scanner-with-trivy.TargetImagePlatform">TargetImagePlatform</a>
- *Default:* Trivy loads an image on a `linux/amd64` machine.

Scan Image on a specific Architecture and OS.

---

##### `trivyIgnore`<sup>Optional</sup> <a name="trivyIgnore" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.trivyIgnore"></a>

```typescript
public readonly trivyIgnore: TrivyIgnore;
```

- *Type:* <a href="#image-scanner-with-trivy.TrivyIgnore">TrivyIgnore</a>
- *Default:* no ignore rules

Ignore rules or ignore file for Trivy.

Use `TrivyIgnore.fromRules()` to specify inline ignore rules (equivalent to writing lines
in a `.trivyignore` file), or `TrivyIgnore.fromFilePath()` to point to an existing ignore file.

> [https://trivy.dev/docs/latest/configuration/filtering/#trivyignoreyaml](https://trivy.dev/docs/latest/configuration/filtering/#trivyignoreyaml)

---

##### `vulnsNotificationTopic`<sup>Optional</sup> <a name="vulnsNotificationTopic" id="image-scanner-with-trivy.ImageScannerWithTrivyV2Props.property.vulnsNotificationTopic"></a>

```typescript
public readonly vulnsNotificationTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic
- *Default:* no notification

SNS topic for vulnerabilities notification.

If specified, an SNS topic notification will be sent when vulnerabilities or EOL (End of Life) OS are detected.

The notification is sent regardless of the `failOnVulnerability` setting.
This means you can choose to receive notifications even when you don't want the deployment to fail.

You can specify an SNS topic associated with AWS Chatbot, as notifications are sent in AWS Chatbot message format.

---

### S3OutputOptions <a name="S3OutputOptions" id="image-scanner-with-trivy.S3OutputOptions"></a>

Output configuration for scan logs to S3 bucket.

#### Initializer <a name="Initializer" id="image-scanner-with-trivy.S3OutputOptions.Initializer"></a>

```typescript
import { S3OutputOptions } from 'image-scanner-with-trivy'

const s3OutputOptions: S3OutputOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.S3OutputOptions.property.type">type</a></code> | <code><a href="#image-scanner-with-trivy.ScanLogsOutputType">ScanLogsOutputType</a></code> | The type of scan logs output. |
| <code><a href="#image-scanner-with-trivy.S3OutputOptions.property.bucketName">bucketName</a></code> | <code>string</code> | The name of the S3 bucket. |
| <code><a href="#image-scanner-with-trivy.S3OutputOptions.property.prefix">prefix</a></code> | <code>string</code> | Optional prefix for S3 objects. |
| <code><a href="#image-scanner-with-trivy.S3OutputOptions.property.sbomFormat">sbomFormat</a></code> | <code><a href="#image-scanner-with-trivy.SbomFormat">SbomFormat</a></code> | Optional SBOM format to output in addition to scan logs. |

---

##### `type`<sup>Required</sup> <a name="type" id="image-scanner-with-trivy.S3OutputOptions.property.type"></a>

```typescript
public readonly type: ScanLogsOutputType;
```

- *Type:* <a href="#image-scanner-with-trivy.ScanLogsOutputType">ScanLogsOutputType</a>

The type of scan logs output.

---

##### `bucketName`<sup>Required</sup> <a name="bucketName" id="image-scanner-with-trivy.S3OutputOptions.property.bucketName"></a>

```typescript
public readonly bucketName: string;
```

- *Type:* string

The name of the S3 bucket.

---

##### `prefix`<sup>Optional</sup> <a name="prefix" id="image-scanner-with-trivy.S3OutputOptions.property.prefix"></a>

```typescript
public readonly prefix: string;
```

- *Type:* string

Optional prefix for S3 objects.

---

##### `sbomFormat`<sup>Optional</sup> <a name="sbomFormat" id="image-scanner-with-trivy.S3OutputOptions.property.sbomFormat"></a>

```typescript
public readonly sbomFormat: SbomFormat;
```

- *Type:* <a href="#image-scanner-with-trivy.SbomFormat">SbomFormat</a>
- *Default:* No SBOM output

Optional SBOM format to output in addition to scan logs.

---

### S3OutputProps <a name="S3OutputProps" id="image-scanner-with-trivy.S3OutputProps"></a>

Configuration for scan logs output to S3 bucket.

#### Initializer <a name="Initializer" id="image-scanner-with-trivy.S3OutputProps.Initializer"></a>

```typescript
import { S3OutputProps } from 'image-scanner-with-trivy'

const s3OutputProps: S3OutputProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.S3OutputProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket to output scan logs. |
| <code><a href="#image-scanner-with-trivy.S3OutputProps.property.prefix">prefix</a></code> | <code>string</code> | Optional prefix for S3 objects. |
| <code><a href="#image-scanner-with-trivy.S3OutputProps.property.sbomFormat">sbomFormat</a></code> | <code><a href="#image-scanner-with-trivy.SbomFormat">SbomFormat</a></code> | Optional SBOM format to output in addition to scan logs. When specified, SBOM will be generated and uploaded to S3. |

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="image-scanner-with-trivy.S3OutputProps.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket to output scan logs.

---

##### `prefix`<sup>Optional</sup> <a name="prefix" id="image-scanner-with-trivy.S3OutputProps.property.prefix"></a>

```typescript
public readonly prefix: string;
```

- *Type:* string

Optional prefix for S3 objects.

---

##### `sbomFormat`<sup>Optional</sup> <a name="sbomFormat" id="image-scanner-with-trivy.S3OutputProps.property.sbomFormat"></a>

```typescript
public readonly sbomFormat: SbomFormat;
```

- *Type:* <a href="#image-scanner-with-trivy.SbomFormat">SbomFormat</a>
- *Default:* No SBOM output

Optional SBOM format to output in addition to scan logs. When specified, SBOM will be generated and uploaded to S3.

**Note**: SBOM generation is not a vulnerability scan. When this option is specified:
- Trivy generates a Software Bill of Materials (SBOM) instead of performing a vulnerability scan
- The scan will not fail regardless of the `failOnVulnerability` setting
- SNS notifications (`vulnsNotificationTopic`) will not be sent since no vulnerabilities are detected
- The SBOM file and stderr logs will be uploaded to S3

---

### ScanLogsOutputOptions <a name="ScanLogsOutputOptions" id="image-scanner-with-trivy.ScanLogsOutputOptions"></a>

Output configurations for scan logs.

#### Initializer <a name="Initializer" id="image-scanner-with-trivy.ScanLogsOutputOptions.Initializer"></a>

```typescript
import { ScanLogsOutputOptions } from 'image-scanner-with-trivy'

const scanLogsOutputOptions: ScanLogsOutputOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.ScanLogsOutputOptions.property.type">type</a></code> | <code><a href="#image-scanner-with-trivy.ScanLogsOutputType">ScanLogsOutputType</a></code> | The type of scan logs output. |

---

##### `type`<sup>Required</sup> <a name="type" id="image-scanner-with-trivy.ScanLogsOutputOptions.property.type"></a>

```typescript
public readonly type: ScanLogsOutputType;
```

- *Type:* <a href="#image-scanner-with-trivy.ScanLogsOutputType">ScanLogsOutputType</a>

The type of scan logs output.

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
public bind(grantee: IGrantable): ScanLogsOutputOptions
```

Returns the output configuration for scan logs.

###### `grantee`<sup>Required</sup> <a name="grantee" id="image-scanner-with-trivy.ScanLogsOutput.bind.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.ScanLogsOutput.cloudWatchLogs">cloudWatchLogs</a></code> | Scan logs output to CloudWatch Logs log group. |
| <code><a href="#image-scanner-with-trivy.ScanLogsOutput.s3">s3</a></code> | Scan logs output to S3 bucket. |

---

##### `cloudWatchLogs` <a name="cloudWatchLogs" id="image-scanner-with-trivy.ScanLogsOutput.cloudWatchLogs"></a>

```typescript
import { ScanLogsOutput } from 'image-scanner-with-trivy'

ScanLogsOutput.cloudWatchLogs(options: CloudWatchLogsOutputProps)
```

Scan logs output to CloudWatch Logs log group.

**Note on Large Scan Results**: CloudWatch Logs has a limit of 1 MB per log event.
If Trivy scan results exceed this limit, they will be automatically
split into multiple log events. Each chunk will be prefixed with `[part X/Y]` to
indicate the sequence, ensuring no data loss while staying within CloudWatch Logs quotas.
**For large scan results, we recommend using S3 output instead** to avoid fragmentation
and make it easier to view complete results.

###### `options`<sup>Required</sup> <a name="options" id="image-scanner-with-trivy.ScanLogsOutput.cloudWatchLogs.parameter.options"></a>

- *Type:* <a href="#image-scanner-with-trivy.CloudWatchLogsOutputProps">CloudWatchLogsOutputProps</a>

---

##### `s3` <a name="s3" id="image-scanner-with-trivy.ScanLogsOutput.s3"></a>

```typescript
import { ScanLogsOutput } from 'image-scanner-with-trivy'

ScanLogsOutput.s3(options: S3OutputProps)
```

Scan logs output to S3 bucket.

###### `options`<sup>Required</sup> <a name="options" id="image-scanner-with-trivy.ScanLogsOutput.s3.parameter.options"></a>

- *Type:* <a href="#image-scanner-with-trivy.S3OutputProps">S3OutputProps</a>

---



### TargetImagePlatform <a name="TargetImagePlatform" id="image-scanner-with-trivy.TargetImagePlatform"></a>

Enum for Target Image Platform.


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.TargetImagePlatform.custom">custom</a></code> | Custom value for target image platform. |

---

##### `custom` <a name="custom" id="image-scanner-with-trivy.TargetImagePlatform.custom"></a>

```typescript
import { TargetImagePlatform } from 'image-scanner-with-trivy'

TargetImagePlatform.custom(value: string)
```

Custom value for target image platform.

The value should be in the format OS/Architecture for the image, such as `linux/arm64`.

###### `value`<sup>Required</sup> <a name="value" id="image-scanner-with-trivy.TargetImagePlatform.custom.parameter.value"></a>

- *Type:* string

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.TargetImagePlatform.property.value">value</a></code> | <code>string</code> | *No description.* |

---

##### `value`<sup>Required</sup> <a name="value" id="image-scanner-with-trivy.TargetImagePlatform.property.value"></a>

```typescript
public readonly value: string;
```

- *Type:* string

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.TargetImagePlatform.property.LINUX_AMD64">LINUX_AMD64</a></code> | <code><a href="#image-scanner-with-trivy.TargetImagePlatform">TargetImagePlatform</a></code> | Linux AMD64 platform. |
| <code><a href="#image-scanner-with-trivy.TargetImagePlatform.property.LINUX_ARM64">LINUX_ARM64</a></code> | <code><a href="#image-scanner-with-trivy.TargetImagePlatform">TargetImagePlatform</a></code> | Linux ARM64 platform. |

---

##### `LINUX_AMD64`<sup>Required</sup> <a name="LINUX_AMD64" id="image-scanner-with-trivy.TargetImagePlatform.property.LINUX_AMD64"></a>

```typescript
public readonly LINUX_AMD64: TargetImagePlatform;
```

- *Type:* <a href="#image-scanner-with-trivy.TargetImagePlatform">TargetImagePlatform</a>

Linux AMD64 platform.

---

##### `LINUX_ARM64`<sup>Required</sup> <a name="LINUX_ARM64" id="image-scanner-with-trivy.TargetImagePlatform.property.LINUX_ARM64"></a>

```typescript
public readonly LINUX_ARM64: TargetImagePlatform;
```

- *Type:* <a href="#image-scanner-with-trivy.TargetImagePlatform">TargetImagePlatform</a>

Linux ARM64 platform.

---

### TrivyIgnore <a name="TrivyIgnore" id="image-scanner-with-trivy.TrivyIgnore"></a>

Union-like class for specifying Trivy ignore configuration.

You can either specify ignore rules inline, or point to an existing ignore file.


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.TrivyIgnore.fromFilePath">fromFilePath</a></code> | Specify the path to an existing trivyignore file. |
| <code><a href="#image-scanner-with-trivy.TrivyIgnore.fromRules">fromRules</a></code> | Specify ignore rules inline (equivalent to writing lines in a .trivyignore file). |

---

##### `fromFilePath` <a name="fromFilePath" id="image-scanner-with-trivy.TrivyIgnore.fromFilePath"></a>

```typescript
import { TrivyIgnore } from 'image-scanner-with-trivy'

TrivyIgnore.fromFilePath(path: string, fileType?: TrivyIgnoreFileType)
```

Specify the path to an existing trivyignore file.

> [https://trivy.dev/docs/latest/configuration/filtering/#trivyignoreyaml](https://trivy.dev/docs/latest/configuration/filtering/#trivyignoreyaml)

###### `path`<sup>Required</sup> <a name="path" id="image-scanner-with-trivy.TrivyIgnore.fromFilePath.parameter.path"></a>

- *Type:* string

Path to the ignore file.

---

###### `fileType`<sup>Optional</sup> <a name="fileType" id="image-scanner-with-trivy.TrivyIgnore.fromFilePath.parameter.fileType"></a>

- *Type:* <a href="#image-scanner-with-trivy.TrivyIgnoreFileType">TrivyIgnoreFileType</a>

File format.

Defaults to `TrivyIgnoreFileType.TRIVYIGNORE`.

---

##### `fromRules` <a name="fromRules" id="image-scanner-with-trivy.TrivyIgnore.fromRules"></a>

```typescript
import { TrivyIgnore } from 'image-scanner-with-trivy'

TrivyIgnore.fromRules(rules: string[])
```

Specify ignore rules inline (equivalent to writing lines in a .trivyignore file).

> [https://trivy.dev/docs/latest/configuration/filtering/#trivyignore](https://trivy.dev/docs/latest/configuration/filtering/#trivyignore)

###### `rules`<sup>Required</sup> <a name="rules" id="image-scanner-with-trivy.TrivyIgnore.fromRules.parameter.rules"></a>

- *Type:* string[]

Each element corresponds to one line in the .trivyignore file.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#image-scanner-with-trivy.TrivyIgnore.property.rules">rules</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#image-scanner-with-trivy.TrivyIgnore.property.fileType">fileType</a></code> | <code><a href="#image-scanner-with-trivy.TrivyIgnoreFileType">TrivyIgnoreFileType</a></code> | *No description.* |

---

##### `rules`<sup>Required</sup> <a name="rules" id="image-scanner-with-trivy.TrivyIgnore.property.rules"></a>

```typescript
public readonly rules: string[];
```

- *Type:* string[]

---

##### `fileType`<sup>Optional</sup> <a name="fileType" id="image-scanner-with-trivy.TrivyIgnore.property.fileType"></a>

```typescript
public readonly fileType: TrivyIgnoreFileType;
```

- *Type:* <a href="#image-scanner-with-trivy.TrivyIgnoreFileType">TrivyIgnoreFileType</a>

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


### SbomFormat <a name="SbomFormat" id="image-scanner-with-trivy.SbomFormat"></a>

SBOM (Software Bill of Materials) output format for Trivy scans.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.SbomFormat.CYCLONEDX">CYCLONEDX</a></code> | CycloneDX JSON format. |
| <code><a href="#image-scanner-with-trivy.SbomFormat.SPDX_JSON">SPDX_JSON</a></code> | SPDX JSON format. |
| <code><a href="#image-scanner-with-trivy.SbomFormat.SPDX">SPDX</a></code> | SPDX Tag-Value format (human-readable). |

---

##### `CYCLONEDX` <a name="CYCLONEDX" id="image-scanner-with-trivy.SbomFormat.CYCLONEDX"></a>

CycloneDX JSON format.

---


##### `SPDX_JSON` <a name="SPDX_JSON" id="image-scanner-with-trivy.SbomFormat.SPDX_JSON"></a>

SPDX JSON format.

---


##### `SPDX` <a name="SPDX" id="image-scanner-with-trivy.SbomFormat.SPDX"></a>

SPDX Tag-Value format (human-readable).

---


### ScanLogsOutputType <a name="ScanLogsOutputType" id="image-scanner-with-trivy.ScanLogsOutputType"></a>

Enum for ScanLogsOutputType.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.ScanLogsOutputType.CLOUDWATCH_LOGS">CLOUDWATCH_LOGS</a></code> | Output scan logs to CloudWatch Logs. |
| <code><a href="#image-scanner-with-trivy.ScanLogsOutputType.S3">S3</a></code> | Output scan logs to S3 bucket. |

---

##### `CLOUDWATCH_LOGS` <a name="CLOUDWATCH_LOGS" id="image-scanner-with-trivy.ScanLogsOutputType.CLOUDWATCH_LOGS"></a>

Output scan logs to CloudWatch Logs.

---


##### `S3` <a name="S3" id="image-scanner-with-trivy.ScanLogsOutputType.S3"></a>

Output scan logs to S3 bucket.

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


### TrivyIgnoreFileType <a name="TrivyIgnoreFileType" id="image-scanner-with-trivy.TrivyIgnoreFileType"></a>

File type for TrivyIgnore file path.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#image-scanner-with-trivy.TrivyIgnoreFileType.TRIVYIGNORE">TRIVYIGNORE</a></code> | .trivyignore file. |
| <code><a href="#image-scanner-with-trivy.TrivyIgnoreFileType.TRIVYIGNORE_YAML">TRIVYIGNORE_YAML</a></code> | .trivyignore.yaml file. |

---

##### `TRIVYIGNORE` <a name="TRIVYIGNORE" id="image-scanner-with-trivy.TrivyIgnoreFileType.TRIVYIGNORE"></a>

.trivyignore file.

> [https://trivy.dev/docs/latest/configuration/filtering/#trivyignore](https://trivy.dev/docs/latest/configuration/filtering/#trivyignore)

---


##### `TRIVYIGNORE_YAML` <a name="TRIVYIGNORE_YAML" id="image-scanner-with-trivy.TrivyIgnoreFileType.TRIVYIGNORE_YAML"></a>

.trivyignore.yaml file.

> [https://trivy.dev/docs/latest/configuration/filtering/#trivyignoreyaml](https://trivy.dev/docs/latest/configuration/filtering/#trivyignoreyaml)

---

