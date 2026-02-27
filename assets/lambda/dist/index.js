"use strict";var L=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var V=Object.getOwnPropertyNames;var A=Object.prototype.hasOwnProperty;var M=(e,t)=>{for(var n in t)L(e,n,{get:t[n],enumerable:!0})},K=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of V(t))!A.call(e,r)&&r!==n&&L(e,r,{get:()=>t[r],enumerable:!(o=_(t,r))||o.enumerable});return e};var j=e=>K(L({},"__esModule",{value:!0}),e);var J={};M(J,{handler:()=>W});module.exports=j(J);var O=require("child_process"),C=require("fs");var w="/tmp/.trivyignore",b="/tmp/.trivyignore.yaml",x=e=>{let t=[];t.push("--no-progress");let n=e.output?.type==="s3"?e.output.sbomFormat:void 0;if(n&&t.push(`--format ${n}`),e.ignoreUnfixed==="true"&&t.push("--ignore-unfixed"),e.severity.length&&t.push(`--severity ${e.severity.join(",")}`),e.scanners.length&&t.push(`--scanners ${e.scanners.join(",")}`),e.imageConfigScanners.length&&t.push(`--image-config-scanners ${e.imageConfigScanners.join(",")}`),e.exitCode&&t.push(`--exit-code ${e.exitCode}`),e.exitOnEol&&t.push(`--exit-on-eol ${e.exitOnEol}`),e.exitCode==null&&t.push("--exit-code 1 --exit-on-eol 1"),e.trivyIgnore.length){let o=e.trivyIgnoreFileType==="TRIVYIGNORE_YAML"?b:w;t.push(`--ignorefile ${o}`)}return e.platform&&t.push(`--platform ${e.platform}`),t},N=(e,t)=>{let n=`/opt/trivy image ${t.join(" ")} ${e}`;return console.log("imageUri: "+e),console.log("command: "+n),(0,O.spawnSync)(n,{shell:!0,maxBuffer:50*1024*1024})},k=(e,t)=>{(0,C.writeFileSync)(t==="TRIVYIGNORE_YAML"?b:w,e.join(`
`),"utf-8")};var m=require("@aws-sdk/client-cloudwatch-logs"),f=new m.CloudWatchLogsClient,R=async(e,t,n)=>{let[o,r]=n.split(":"),s=r?`uri=${o},tag=${r}`:`uri=${o}`;try{await f.send(new m.CreateLogStreamCommand({logGroupName:t.logGroupName,logStreamName:s}))}catch(u){if(u instanceof m.ResourceAlreadyExistsException)console.log(`Log stream ${s} already exists in log group ${t.logGroupName}.`);else throw u}let a=new Date().getTime(),c={logGroupName:t.logGroupName,logStreamName:s,logEvents:[{timestamp:a,message:`stderr:
`+e.stderr.toString()},{timestamp:a,message:`stdout:
`+e.stdout.toString()}]},i=new m.PutLogEventsCommand(c);return await f.send(i),console.log(`Scan logs output to the log group: ${t.logGroupName}, log stream: ${s}`),{type:"cloudwatch",logGroupName:t.logGroupName,logStreamName:s}},T=async(e,t,n)=>{let[o,r]=n.split(":"),s=r?`uri=${o},tag=${r}`:`uri=${o}`,a=`${s}/stdout`,c=`${s}/stderr`,i=new Date().getTime();return await I(t.logGroupName,a,i,e.stdout.toString()),await I(t.logGroupName,c,i,e.stderr.toString()),console.log(`Scan logs output to the log group: ${t.logGroupName}
  stdout stream: ${a}
  stderr stream: ${c}`),{type:"cloudwatch-v2",logGroupName:t.logGroupName,stdoutLogStreamName:a,stderrLogStreamName:c}},G=1048576,Y=e=>{let n=new TextEncoder().encode(e);if(n.length<=G)return[e];let o=[],r=0,a=G-20;for(;r<n.length;){let c=n.slice(r,r+a),i=new TextDecoder("utf-8",{fatal:!1});o.push(i.decode(c)),r+=a}return o},I=async(e,t,n,o)=>{try{await f.send(new m.CreateLogStreamCommand({logGroupName:e,logStreamName:t}))}catch(u){if(u instanceof m.ResourceAlreadyExistsException)console.log(`Log stream ${t} already exists in log group ${e}.`);else throw u}let r=Y(o),s=r.length;s>1&&console.log(`Message size exceeds 1 MB limit. Splitting into ${s} chunks.`);let a=r.map((u,p)=>({timestamp:n+p,message:s>1?`[part ${p+1}/${s}] ${u}`:u})),c={logGroupName:e,logStreamName:t,logEvents:a},i=new m.PutLogEventsCommand(c);await f.send(i)};var l=require("@aws-sdk/client-s3");var y=new l.S3Client,P=async(e,t,n)=>{let o=new Date().toISOString(),[r,s]=n.split(":"),a=r.replace(/\//g,"_"),c=s?s.replace(/\//g,"_"):"latest",u=`${t.prefix?t.prefix.endsWith("/")?t.prefix:`${t.prefix}/`:""}${a}/${c}/${o}`,p=e.stderr.toString(),$=e.stdout.toString(),S=`${u}/stderr.txt`,g;if(t.sbomFormat){let B=t.sbomFormat==="spdx"?"spdx":"json",F=t.sbomFormat==="spdx"?"text/plain":"application/json";g=`${u}/sbom.${B}`,await Promise.all([y.send(new l.PutObjectCommand({Bucket:t.bucketName,Key:g,Body:$,ContentType:F})),y.send(new l.PutObjectCommand({Bucket:t.bucketName,Key:S,Body:p,ContentType:"text/plain"}))]),console.log(`SBOM and logs output to S3:
  SBOM: s3://${t.bucketName}/${g}
  stderr: s3://${t.bucketName}/${S}`)}else g=`${u}/stdout.txt`,await Promise.all([y.send(new l.PutObjectCommand({Bucket:t.bucketName,Key:S,Body:p,ContentType:"text/plain"})),y.send(new l.PutObjectCommand({Bucket:t.bucketName,Key:g,Body:$,ContentType:"text/plain"}))]),console.log(`Scan logs output to S3:
  stderr: s3://${t.bucketName}/${S}
  stdout: s3://${t.bucketName}/${g}`);return{type:"s3",bucketName:t.bucketName,stderrKey:S,stdoutKey:g}};var h=require("@aws-sdk/client-sns"),H=new h.SNSClient,v=async(e,t,n,o)=>{let r="",s="";o.type==="cloudwatch"?(r=`CloudWatch Logs:
  Log Group: ${o.logGroupName}
  Log Stream: ${o.logStreamName}`,s=`\`\`\`
aws logs tail ${o.logGroupName} --log-stream-names ${o.logStreamName} --since 1h
\`\`\``):o.type==="cloudwatch-v2"?(r=`CloudWatch Logs:
  Log Group: ${o.logGroupName}
  Stdout Stream: ${o.stdoutLogStreamName}
  Stderr Stream: ${o.stderrLogStreamName}`,s=`- View stdout:
\`\`\`
aws logs tail ${o.logGroupName} --log-stream-names ${o.stdoutLogStreamName} --since 1h
\`\`\`

- View stderr:
\`\`\`
aws logs tail ${o.logGroupName} --log-stream-names ${o.stderrLogStreamName} --since 1h
\`\`\``):o.type==="s3"?(r=`S3:
  Bucket: ${o.bucketName}
  stderr: s3://${o.bucketName}/${o.stderrKey}
  stdout: s3://${o.bucketName}/${o.stdoutKey}`,s=`- View stderr:
\`\`\`
aws s3 cp s3://${o.bucketName}/${o.stderrKey} -
\`\`\`

- View stdout:
\`\`\`
aws s3 cp s3://${o.bucketName}/${o.stdoutKey} -
\`\`\``):o.type==="default"&&(r=`CloudWatch Logs:
  Log Group: ${o.logGroupName}`,s=`\`\`\`
aws logs tail ${o.logGroupName} --since 1h
\`\`\``);let a=`${r}

How to view logs:
${s}`,c={version:"1.0",source:"custom",content:{title:"\u{1F512} Image Scanner with Trivy - Vulnerability Alert",description:`## Scanned Image
${n}

## Scan Logs
${a}

## Details
${t}`}},i=`Image Scanner with Trivy detected vulnerabilities in ${n}

${a}

${t}`,u={default:i,email:i,https:JSON.stringify(c)};try{await H.send(new h.PublishCommand({TopicArn:e,Message:JSON.stringify(u),MessageStructure:"json"})),console.log(`Vulnerability notification sent to SNS topic: ${e}`)}catch(p){console.error(`Failed to send vulnerability notification to SNS: ${p}`)}};var d=require("@aws-sdk/client-cloudformation"),X=new d.CloudFormationClient,E=async e=>{let t=new d.DescribeStacksCommand({StackName:e}),n=await X.send(t);if(n.Stacks&&n.Stacks.length>0){let o=n.Stacks[0].StackStatus;return o===d.ResourceStatus.ROLLBACK_IN_PROGRESS||o===d.ResourceStatus.UPDATE_ROLLBACK_IN_PROGRESS}throw new Error(`Stack not found or no stacks returned from DescribeStacks command, stackId: ${e}`)};var W=async function(e){let t=e.RequestType,n=e.ResourceProperties;if(!n.addr||!n.imageUri)throw new Error("addr and imageUri are required.");let o={PhysicalResourceId:n.addr,Data:{}};if(t!=="Create"&&t!=="Update")return o;n.trivyIgnore.length&&(console.log("trivyignore: "+JSON.stringify(n.trivyIgnore)),k(n.trivyIgnore,n.trivyIgnoreFileType));let r=x(n),s=N(n.imageUri,r),a=await z(s,n.imageUri,n.exitCode==null,n.output,n.defaultLogGroupName);if(s.status===0)return o;let c=s.status===1?"vulnerabilities or end-of-life (EOL) image detected":`unexpected exit code ${s.status}`,i=`Error: ${s.error}
Signal: ${s.signal}
Status: ${c}
Image Scanner returned fatal errors. You may have vulnerabilities. See logs.`;if(n.vulnsTopicArn&&await v(n.vulnsTopicArn,i,n.imageUri,a),n.failOnVulnerability==="false")return o;if(n.suppressErrorOnRollback==="true"&&await E(e.StackId))return console.log(`Vulnerabilities may be detected, but suppressing errors during rollback (suppressErrorOnRollback=true).
${i}`),o;throw new Error(i)},z=async(e,t,n,o,r)=>{switch(o?.type){case"cloudWatchLogs":return n?await T(e,o,t):await R(e,o,t);case"s3":return await P(e,o,t);default:return console.log(`stderr:
`+e.stderr.toString()),console.log(`stdout:
`+e.stdout.toString()),{type:"default",logGroupName:r}}};0&&(module.exports={handler});
