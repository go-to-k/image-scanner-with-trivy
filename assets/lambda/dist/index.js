"use strict";var L=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var _=Object.getOwnPropertyNames;var K=Object.prototype.hasOwnProperty;var A=(o,t)=>{for(var n in t)L(o,n,{get:t[n],enumerable:!0})},M=(o,t,n,e)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of _(t))!K.call(o,s)&&s!==n&&L(o,s,{get:()=>t[s],enumerable:!(e=V(t,s))||e.enumerable});return o};var j=o=>M(L({},"__esModule",{value:!0}),o);var J={};A(J,{handler:()=>E});module.exports=j(J);var h=require("child_process"),w=require("fs");var C="/tmp/.trivyignore",N="/tmp/.trivyignore.yaml",x=o=>{let t=[];t.push("--no-progress");let n=o.output?.type==="s3"?o.output.sbomFormat:void 0;if(n&&t.push(`--format ${n}`),o.ignoreUnfixed==="true"&&t.push("--ignore-unfixed"),o.severity.length&&t.push(`--severity ${o.severity.join(",")}`),o.scanners.length&&t.push(`--scanners ${o.scanners.join(",")}`),o.imageConfigScanners.length&&t.push(`--image-config-scanners ${o.imageConfigScanners.join(",")}`),o.exitCode&&t.push(`--exit-code ${o.exitCode}`),o.exitOnEol&&t.push(`--exit-on-eol ${o.exitOnEol}`),o.exitCode==null&&t.push("--exit-code 1 --exit-on-eol 1"),o.trivyIgnore.length){let e=o.trivyIgnoreFileType==="TRIVYIGNORE_YAML"?N:C;t.push(`--ignorefile ${e}`)}return o.platform&&t.push(`--platform ${o.platform}`),t},k=(o,t)=>{let n=`/opt/trivy image ${t.join(" ")} ${o}`;return console.log("imageUri: "+o),console.log("command: "+n),(0,h.spawnSync)(n,{shell:!0,maxBuffer:50*1024*1024})},G=(o,t)=>{(0,w.writeFileSync)(t==="TRIVYIGNORE_YAML"?N:C,o.join(`
`),"utf-8")};var u=require("@aws-sdk/client-cloudwatch-logs"),S=new u.CloudWatchLogsClient,R=async(o,t,n)=>{let[e,s]=n.split(":"),r=s?`uri=${e},tag=${s}`:`uri=${e}`;try{await S.send(new u.CreateLogStreamCommand({logGroupName:t.logGroupName,logStreamName:r}))}catch(m){if(m instanceof u.ResourceAlreadyExistsException)console.log(`Log stream ${r} already exists in log group ${t.logGroupName}.`);else throw m}let a=new Date().getTime(),c={logGroupName:t.logGroupName,logStreamName:r,logEvents:[{timestamp:a,message:`stderr:
`+o.stderr.toString()},{timestamp:a,message:`stdout:
`+o.stdout.toString()}]},i=new u.PutLogEventsCommand(c);return await S.send(i),console.log(`Scan logs output to the log group: ${t.logGroupName}, log stream: ${r}`),{type:"cloudwatch",logGroupName:t.logGroupName,logStreamName:r}},P=async(o,t,n)=>{let[e,s]=n.split(":"),r=s?`uri=${e},tag=${s}`:`uri=${e}`,a=`${r}/stdout`,c=`${r}/stderr`,i=new Date().getTime();return await I(t.logGroupName,a,i,o.stdout.toString()),await I(t.logGroupName,c,i,o.stderr.toString()),console.log(`Scan logs output to the log group: ${t.logGroupName}
  stdout stream: ${a}
  stderr stream: ${c}`),{type:"cloudwatch-v2",logGroupName:t.logGroupName,stdoutLogStreamName:a,stderrLogStreamName:c}},I=async(o,t,n,e)=>{try{await S.send(new u.CreateLogStreamCommand({logGroupName:o,logStreamName:t}))}catch(a){if(a instanceof u.ResourceAlreadyExistsException)console.log(`Log stream ${t} already exists in log group ${o}.`);else throw a}let s={logGroupName:o,logStreamName:t,logEvents:[{timestamp:n,message:e}]},r=new u.PutLogEventsCommand(s);await S.send(r)};var p=require("@aws-sdk/client-s3");var f=new p.S3Client,T=async(o,t,n)=>{let e=new Date().toISOString(),[s,r]=n.split(":"),a=s.replace(/\//g,"_"),c=r?r.replace(/\//g,"_"):"latest",m=`${t.prefix?t.prefix.endsWith("/")?t.prefix:`${t.prefix}/`:""}${a}/${c}/${e}`,l=o.stderr.toString(),O=o.stdout.toString(),d=`${m}/stderr.txt`,b=`${m}/stdout.txt`;if(t.sbomFormat){let F=t.sbomFormat==="spdx"?"spdx":"json",B=t.sbomFormat==="spdx"?"text/plain":"application/json",$=`${m}/sbom.${F}`;return await Promise.all([f.send(new p.PutObjectCommand({Bucket:t.bucketName,Key:$,Body:O,ContentType:B})),f.send(new p.PutObjectCommand({Bucket:t.bucketName,Key:d,Body:l,ContentType:"text/plain"}))]),console.log(`SBOM and logs output to S3:
  SBOM: s3://${t.bucketName}/${$}
  stderr: s3://${t.bucketName}/${d}`),{type:"s3-sbom",bucketName:t.bucketName,stderrKey:d,sbomKey:$,sbomFormat:t.sbomFormat}}else return await Promise.all([f.send(new p.PutObjectCommand({Bucket:t.bucketName,Key:d,Body:l,ContentType:"text/plain"})),f.send(new p.PutObjectCommand({Bucket:t.bucketName,Key:b,Body:O,ContentType:"text/plain"}))]),console.log(`Scan logs output to S3:
  stderr: s3://${t.bucketName}/${d}
  stdout: s3://${t.bucketName}/${b}`),{type:"s3",bucketName:t.bucketName,stderrKey:d,stdoutKey:b}};var y=require("@aws-sdk/client-sns"),Y=new y.SNSClient,v=async(o,t,n,e)=>{let s="",r="";e.type==="cloudwatch"?(s=`CloudWatch Logs:
  Log Group: ${e.logGroupName}
  Log Stream: ${e.logStreamName}`,r=`aws logs tail ${e.logGroupName} --log-stream-names ${e.logStreamName} --since 1h`):e.type==="cloudwatch-v2"?(s=`CloudWatch Logs:
  Log Group: ${e.logGroupName}
  Stdout Stream: ${e.stdoutLogStreamName}
  Stderr Stream: ${e.stderrLogStreamName}`,r=`# View stdout:
aws logs tail ${e.logGroupName} --log-stream-names ${e.stdoutLogStreamName} --since 1h

# View stderr:
aws logs tail ${e.logGroupName} --log-stream-names ${e.stderrLogStreamName} --since 1h`):e.type==="s3"?(s=`S3:
  Bucket: ${e.bucketName}
  stderr: s3://${e.bucketName}/${e.stderrKey}
  stdout: s3://${e.bucketName}/${e.stdoutKey}`,r=`# View stderr:
aws s3 cp s3://${e.bucketName}/${e.stderrKey} -

# View stdout:
aws s3 cp s3://${e.bucketName}/${e.stdoutKey} -`):e.type==="s3-sbom"?(s=`S3:
  Bucket: ${e.bucketName}
  SBOM (${e.sbomFormat}): s3://${e.bucketName}/${e.sbomKey}
  stderr: s3://${e.bucketName}/${e.stderrKey}`,r=`# View SBOM:
aws s3 cp s3://${e.bucketName}/${e.sbomKey} -

# View stderr:
aws s3 cp s3://${e.bucketName}/${e.stderrKey} -`):e.type==="default"&&(s=`CloudWatch Logs:
  Log Group: ${e.logGroupName}`,r=`aws logs tail ${e.logGroupName} --since 1h`);let a=`${s}

How to view logs:
${r}`,c={version:"1.0",source:"custom",content:{title:"\u{1F512} Image Scanner with Trivy - Vulnerability Alert",description:`Image: ${n}

${a}

Details:
${t}`}},i=`Image Scanner with Trivy detected vulnerabilities in ${n}

${a}

${t}`,m={default:i,email:i,https:JSON.stringify(c)};try{await Y.send(new y.PublishCommand({TopicArn:o,Message:JSON.stringify(m),MessageStructure:"json"})),console.log(`Vulnerability notification sent to SNS topic: ${o}`)}catch(l){console.error(`Failed to send vulnerability notification to SNS: ${l}`)}};var g=require("@aws-sdk/client-cloudformation"),H=new g.CloudFormationClient,W=async o=>{let t=new g.DescribeStacksCommand({StackName:o}),n=await H.send(t);if(n.Stacks&&n.Stacks.length>0){let e=n.Stacks[0].StackStatus;return e===g.ResourceStatus.ROLLBACK_IN_PROGRESS||e===g.ResourceStatus.UPDATE_ROLLBACK_IN_PROGRESS}throw new Error(`Stack not found or no stacks returned from DescribeStacks command, stackId: ${o}`)};var E=async function(o){let t=o.RequestType,n=o.ResourceProperties;if(!n.addr||!n.imageUri)throw new Error("addr and imageUri are required.");let e={PhysicalResourceId:n.addr,Data:{}};if(t!=="Create"&&t!=="Update")return e;n.trivyIgnore.length&&(console.log("trivyignore: "+JSON.stringify(n.trivyIgnore)),G(n.trivyIgnore,n.trivyIgnoreFileType));let s=x(n),r=k(n.imageUri,s),a=await X(r,n.imageUri,n.exitCode==null,n.output,n.defaultLogGroupName);if(r.status===0)return e;let c=r.status===1?"vulnerabilities or end-of-life (EOL) image detected":`unexpected exit code ${r.status}`,i=`Error: ${r.error}
Signal: ${r.signal}
Status: ${c}
Image Scanner returned fatal errors. You may have vulnerabilities. See logs.`;if(n.vulnsTopicArn&&await v(n.vulnsTopicArn,i,n.imageUri,a),n.failOnVulnerability==="false")return e;if(n.suppressErrorOnRollback==="true"&&await W(o.StackId))return console.log(`Vulnerabilities may be detected, but suppressing errors during rollback (suppressErrorOnRollback=true).
${i}`),e;throw new Error(i)},X=async(o,t,n,e,s)=>{switch(e?.type){case"cloudWatchLogs":return n?await P(o,e,t):await R(o,e,t);case"s3":return await T(o,e,t);default:return console.log(`stderr:
`+o.stderr.toString()),console.log(`stdout:
`+o.stdout.toString()),{type:"default",logGroupName:s}}};0&&(module.exports={handler});
