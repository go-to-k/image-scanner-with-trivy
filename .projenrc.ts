import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'go-to-k',
  authorAddress: '24818752+go-to-k@users.noreply.github.com',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'image-scanner-with-trivy',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/24818752+go-to-k/image-scanner-with-trivy.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();