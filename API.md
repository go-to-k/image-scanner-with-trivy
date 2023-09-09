# replace this

TODO: README

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
- *Default:* 1 - It defaults to 1 IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is 0.

Exit Code.

Use the `exitCode` option if you want to exit with a non-zero exit code.

You can specify 0 if you do not want to exit even when vulnerabilities are detected.

> [https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-code](https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-code)

---

##### `exitOnEol`<sup>Optional</sup> <a name="exitOnEol" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.exitOnEol"></a>

```typescript
public readonly exitOnEol: number;
```

- *Type:* number
- *Default:* 1 - It defaults to 1 IN THIS CONSTRUCT for safety in CI/CD. In the original trivy, it is 0.

Exit on EOL.

Sometimes you may surprisingly get 0 vulnerabilities in an old image:
 - Enabling --ignore-unfixed option while all packages have no fixed versions.
 - Scanning a rather outdated OS (e.g. Ubuntu 10.04).

An OS at the end of service/life (EOL) usually gets into this situation, which is definitely full of vulnerabilities.
`exitOnEol` can fail scanning on EOL OS with a non-zero code.

> [https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-on-eol](https://aquasecurity.github.io/trivy/latest/docs/configuration/others/#exit-on-eol)

---

##### `ignoreUnfixed`<sup>Optional</sup> <a name="ignoreUnfixed" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.ignoreUnfixed"></a>

```typescript
public readonly ignoreUnfixed: boolean;
```

- *Type:* boolean

The unfixed/unfixable vulnerabilities mean that the patch has not yet been provided on their distribution.

To hide unfixed/unfixable vulnerabilities, you can use the `--ignore-unfixed` flag.

> [https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#unfixed-vulnerabilities](https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#unfixed-vulnerabilities)

---

##### `scanners`<sup>Optional</sup> <a name="scanners" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.scanners"></a>

```typescript
public readonly scanners: Scanners[];
```

- *Type:* <a href="#image-scanner-with-trivy.Scanners">Scanners</a>[]
- *Default:* [Scanners.VULN,Scanners.SECRET]

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
- *Default:* [Severity.CRITICAL] - It defaults to `CRITICAL` IN THIS CONSTRUCT for safety in CI/CD, but the default configuration of Trivy is "CRITICAL,HIGH,MEDIUM,LOW,UNKNOWN".

Severity Selection.

The severity is taken from the selected data source since the severity from vendors is more accurate.
Using CVE-2023-0464 as an example, while it is rated as "HIGH" in NVD, Red Hat has marked its 'Impact' as "Low". As a result, Trivy will display it as "Low".

The severity depends on the compile option, the default configuration, etc. NVD doesn't know how the vendor distributes the software.
Red Hat evaluates the severity more accurately. That's why Trivy prefers vendor scores over NVD.

> [https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#severity-selection](https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#severity-selection)

---

##### `trivyIgnore`<sup>Optional</sup> <a name="trivyIgnore" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.trivyIgnore"></a>

```typescript
public readonly trivyIgnore: string[];
```

- *Type:* string[]

By Finding IDs.

The ignore rules written to the .trivyignore in trivy.
Put each line you write in the file into one element of the array.

> [https://aquasecurity.github.io/trivy/latest/docs/configuration/filtering/#trivyignore](https://aquasecurity.github.io/trivy/latest/docs/configuration/filtering/#trivyignore)

---



## Enums <a name="Enums" id="Enums"></a>

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

