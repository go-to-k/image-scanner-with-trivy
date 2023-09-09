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
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.ignoreUnfixed">ignoreUnfixed</a></code> | <code>boolean</code> | The unfixed/unfixable vulnerabilities mean that the patch has not yet been provided on their distribution. |
| <code><a href="#image-scanner-with-trivy.ImageScannerWithTrivyProps.property.severity">severity</a></code> | <code><a href="#image-scanner-with-trivy.Severity">Severity</a>[]</code> | Severity Selection. |

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

##### `ignoreUnfixed`<sup>Optional</sup> <a name="ignoreUnfixed" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.ignoreUnfixed"></a>

```typescript
public readonly ignoreUnfixed: boolean;
```

- *Type:* boolean

The unfixed/unfixable vulnerabilities mean that the patch has not yet been provided on their distribution.

To hide unfixed/unfixable vulnerabilities, you can use the `--ignore-unfixed` flag.

> [https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#unfixed-vulnerabilities](https://aquasecurity.github.io/trivy/latest/docs/scanner/vulnerability/#unfixed-vulnerabilities)

---

##### `severity`<sup>Optional</sup> <a name="severity" id="image-scanner-with-trivy.ImageScannerWithTrivyProps.property.severity"></a>

```typescript
public readonly severity: Severity[];
```

- *Type:* <a href="#image-scanner-with-trivy.Severity">Severity</a>[]
- *Default:* [] - The default configuration of Trivy is "CRITICAL,HIGH,MEDIUM,LOW,UNKNOWN".

Severity Selection.

The severity is taken from the selected data source since the severity from vendors is more accurate.
Using CVE-2023-0464 as an example, while it is rated as "HIGH" in NVD, Red Hat has marked its 'Impact' as "Low". As a result, Trivy will display it as "Low".

The severity depends on the compile option, the default configuration, etc. NVD doesn't know how the vendor distributes the software.
Red Hat evaluates the severity more accurately. That's why Trivy prefers vendor scores over NVD.

> [https://aquasecurity.github.io/trivy/v0.45/docs/scanner/vulnerability/#severity-selection](https://aquasecurity.github.io/trivy/v0.45/docs/scanner/vulnerability/#severity-selection)

---



## Enums <a name="Enums" id="Enums"></a>

### Severity <a name="Severity" id="image-scanner-with-trivy.Severity"></a>

Enum for Severity Selection.

> [https://aquasecurity.github.io/trivy/v0.45/docs/scanner/vulnerability/#severity-selection](https://aquasecurity.github.io/trivy/v0.45/docs/scanner/vulnerability/#severity-selection)

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

