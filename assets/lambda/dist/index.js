"use strict";var O=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var _=Object.getOwnPropertyNames;var V=Object.prototype.hasOwnProperty;var A=(e,t)=>{for(var n in t)O(e,n,{get:t[n],enumerable:!0})},K=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of _(t))!V.call(e,s)&&s!==n&&O(e,s,{get:()=>t[s],enumerable:!(o=B(t,s))||o.enumerable});return e};var j=e=>K(O({},"__esModule",{value:!0}),e);var X={};A(X,{handler:()=>W});module.exports=j(X);var h=require("child_process"),C=require("fs");var b="/tmp/.trivyignore",w="/tmp/.trivyignore.yaml",x=e=>{let t=[];t.push("--no-progress");let n=e.output?.type==="s3"?e.output.sbomFormat:void 0;if(n&&t.push(`--format ${n}`),e.ignoreUnfixed==="true"&&t.push("--ignore-unfixed"),e.severity.length&&t.push(`--severity ${e.severity.join(",")}`),e.scanners.length&&t.push(`--scanners ${e.scanners.join(",")}`),e.imageConfigScanners.length&&t.push(`--image-config-scanners ${e.imageConfigScanners.join(",")}`),e.exitCode&&t.push(`--exit-code ${e.exitCode}`),e.exitOnEol&&t.push(`--exit-on-eol ${e.exitOnEol}`),e.exitCode==null&&t.push("--exit-code 1 --exit-on-eol 1"),e.trivyIgnore.length){let o=e.trivyIgnoreFileType==="TRIVYIGNORE_YAML"?w:b;t.push(`--ignorefile ${o}`)}return e.platform&&t.push(`--platform ${e.platform}`),t},N=(e,t)=>{let n=`/opt/trivy image ${t.join(" ")} ${e}`;return console.log("imageUri: "+e),console.log("command: "+n),(0,h.spawnSync)(n,{shell:!0,maxBuffer:50*1024*1024})},k=(e,t)=>{(0,C.writeFileSync)(t==="TRIVYIGNORE_YAML"?w:b,e.join(`
`),"utf-8")};var c=require("@aws-sdk/client-cloudwatch-logs"),f=new c.CloudWatchLogsClient,I=async(e,t,n)=>{let[o,s]=n.split(":"),r=s?`uri=${o},tag=${s}`:`uri=${o}`;try{await f.send(new c.CreateLogStreamCommand({logGroupName:t.logGroupName,logStreamName:r}))}catch(m){if(m instanceof c.ResourceAlreadyExistsException)console.log(`Log stream ${r} already exists in log group ${t.logGroupName}.`);else throw m}let a=new Date().getTime(),u={logGroupName:t.logGroupName,logStreamName:r,logEvents:[{timestamp:a,message:`stderr:
`+e.stderr.toString()},{timestamp:a,message:`stdout:
`+e.stdout.toString()}]},i=new c.PutLogEventsCommand(u);return await f.send(i),console.log(`Scan logs output to the log group: ${t.logGroupName}, log stream: ${r}`),{type:"cloudwatch",logGroupName:t.logGroupName,logStreamName:r}},R=async(e,t,n)=>{let[o,s]=n.split(":"),r=s?`uri=${o},tag=${s}`:`uri=${o}`,a=`${r}/stdout`,u=`${r}/stderr`,i=new Date().getTime();return await G(t.logGroupName,a,i,e.stdout.toString()),await G(t.logGroupName,u,i,e.stderr.toString()),console.log(`Scan logs output to the log group: ${t.logGroupName}
  stdout stream: ${a}
  stderr stream: ${u}`),{type:"cloudwatch-v2",logGroupName:t.logGroupName,stdoutLogStreamName:a,stderrLogStreamName:u}},G=async(e,t,n,o)=>{try{await f.send(new c.CreateLogStreamCommand({logGroupName:e,logStreamName:t}))}catch(a){if(a instanceof c.ResourceAlreadyExistsException)console.log(`Log stream ${t} already exists in log group ${e}.`);else throw a}let s={logGroupName:e,logStreamName:t,logEvents:[{timestamp:n,message:o}]},r=new c.PutLogEventsCommand(s);await f.send(r)};var g=require("@aws-sdk/client-s3");var y=new g.S3Client,P=async(e,t,n)=>{let o=new Date().toISOString(),[s,r]=n.split(":"),a=s.replace(/\//g,"_"),u=r?r.replace(/\//g,"_"):"latest",m=`${t.prefix?t.prefix.endsWith("/")?t.prefix:`${t.prefix}/`:""}${a}/${u}/${o}`,S=e.stderr.toString(),$=e.stdout.toString(),d=`${m}/stderr.txt`,p;if(t.sbomFormat){let E=t.sbomFormat==="spdx"?"spdx":"json",F=t.sbomFormat==="spdx"?"text/plain":"application/json";p=`${m}/sbom.${E}`,await Promise.all([y.send(new g.PutObjectCommand({Bucket:t.bucketName,Key:p,Body:$,ContentType:F})),y.send(new g.PutObjectCommand({Bucket:t.bucketName,Key:d,Body:S,ContentType:"text/plain"}))]),console.log(`SBOM and logs output to S3:
  SBOM: s3://${t.bucketName}/${p}
  stderr: s3://${t.bucketName}/${d}`)}else p=`${m}/stdout.txt`,await Promise.all([y.send(new g.PutObjectCommand({Bucket:t.bucketName,Key:d,Body:S,ContentType:"text/plain"})),y.send(new g.PutObjectCommand({Bucket:t.bucketName,Key:p,Body:$,ContentType:"text/plain"}))]),console.log(`Scan logs output to S3:
  stderr: s3://${t.bucketName}/${d}
  stdout: s3://${t.bucketName}/${p}`);return{type:"s3",bucketName:t.bucketName,stderrKey:d,stdoutKey:p}};var L=require("@aws-sdk/client-sns"),U=new L.SNSClient,T=async(e,t,n,o)=>{let s="",r="";o.type==="cloudwatch"?(s=`CloudWatch Logs:
  Log Group: ${o.logGroupName}
  Log Stream: ${o.logStreamName}`,r=`aws logs tail ${o.logGroupName} --log-stream-names ${o.logStreamName} --since 1h`):o.type==="cloudwatch-v2"?(s=`CloudWatch Logs:
  Log Group: ${o.logGroupName}
  Stdout Stream: ${o.stdoutLogStreamName}
  Stderr Stream: ${o.stderrLogStreamName}`,r=`# View stdout:
aws logs tail ${o.logGroupName} --log-stream-names ${o.stdoutLogStreamName} --since 1h

# View stderr:
aws logs tail ${o.logGroupName} --log-stream-names ${o.stderrLogStreamName} --since 1h`):o.type==="s3"?(s=`S3:
  Bucket: ${o.bucketName}
  stderr: s3://${o.bucketName}/${o.stderrKey}
  stdout: s3://${o.bucketName}/${o.stdoutKey}`,r=`# View stderr:
aws s3 cp s3://${o.bucketName}/${o.stderrKey} -

# View stdout:
aws s3 cp s3://${o.bucketName}/${o.stdoutKey} -`):o.type==="default"&&(s=`CloudWatch Logs:
  Log Group: ${o.logGroupName}`,r=`aws logs tail ${o.logGroupName} --since 1h`);let a=`${s}

How to view logs:
${r}`,u={version:"1.0",source:"custom",content:{title:"\u{1F512} Image Scanner with Trivy - Vulnerability Alert",description:`Image: ${n}

${a}

Details:
${t}`}},i=`Image Scanner with Trivy detected vulnerabilities in ${n}

${a}

${t}`,m={default:i,email:i,https:JSON.stringify(u)};try{await U.send(new L.PublishCommand({TopicArn:e,Message:JSON.stringify(m),MessageStructure:"json"})),console.log(`Vulnerability notification sent to SNS topic: ${e}`)}catch(S){console.error(`Failed to send vulnerability notification to SNS: ${S}`)}};var l=require("@aws-sdk/client-cloudformation"),Y=new l.CloudFormationClient,v=async e=>{let t=new l.DescribeStacksCommand({StackName:e}),n=await Y.send(t);if(n.Stacks&&n.Stacks.length>0){let o=n.Stacks[0].StackStatus;return o===l.ResourceStatus.ROLLBACK_IN_PROGRESS||o===l.ResourceStatus.UPDATE_ROLLBACK_IN_PROGRESS}throw new Error(`Stack not found or no stacks returned from DescribeStacks command, stackId: ${e}`)};var W=async function(e){let t=e.RequestType,n=e.ResourceProperties;if(!n.addr||!n.imageUri)throw new Error("addr and imageUri are required.");let o={PhysicalResourceId:n.addr,Data:{}};if(t!=="Create"&&t!=="Update")return o;n.trivyIgnore.length&&(console.log("trivyignore: "+JSON.stringify(n.trivyIgnore)),k(n.trivyIgnore,n.trivyIgnoreFileType));let s=x(n),r=N(n.imageUri,s),a=await H(r,n.imageUri,n.exitCode==null,n.output,n.defaultLogGroupName);if(r.status===0)return o;let u=r.status===1?"vulnerabilities or end-of-life (EOL) image detected":`unexpected exit code ${r.status}`,i=`Error: ${r.error}
Signal: ${r.signal}
Status: ${u}
Image Scanner returned fatal errors. You may have vulnerabilities. See logs.`;if(n.vulnsTopicArn&&await T(n.vulnsTopicArn,i,n.imageUri,a),n.failOnVulnerability==="false")return o;if(n.suppressErrorOnRollback==="true"&&await v(e.StackId))return console.log(`Vulnerabilities may be detected, but suppressing errors during rollback (suppressErrorOnRollback=true).
${i}`),o;throw new Error(i)},H=async(e,t,n,o,s)=>{switch(o?.type){case"cloudWatchLogs":return n?await R(e,o,t):await I(e,o,t);case"s3":return await P(e,o,t);default:return console.log(`stderr:
`+e.stderr.toString()),console.log(`stdout:
`+e.stdout.toString()),{type:"default",logGroupName:s}}};0&&(module.exports={handler});
