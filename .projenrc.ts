import { awscdk } from 'projen';
import { TrailingComma, Transform } from 'projen/lib/javascript';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'go-to-k',
  authorAddress: '24818752+go-to-k@users.noreply.github.com',
  majorVersion: 1,
  minNodeVersion: '18.0.0',
  cdkVersion: '2.95.1',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'image-scanner-with-trivy',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/go-to-k/image-scanner-with-trivy',
  description: 'Scan container images with Trivy in CDK deployment',
  prettier: true,
  prettierOptions: {
    settings: {
      singleQuote: true,
      jsxSingleQuote: true,
      trailingComma: TrailingComma.ALL,
      semi: true,
      printWidth: 100,
    },
  },
  eslintOptions: {
    dirs: ['src'],
    prettier: true,
    ignorePatterns: [
      'example/**/*',
      'lambda/**/*',
      'test/assets/**/*',
      'test/*.snapshot/**/*',
      '*.d.ts',
    ],
  },
  jestOptions: {
    configFilePath: 'jest.config.json',
    jestConfig: {
      testEnvironment: 'node',
      roots: ['<rootDir>/test'],
      testMatch: ['**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': new Transform('ts-jest'),
      },
      snapshotSerializers: ['<rootDir>/test/snapshot-plugin.ts'],
    },
  },
  license: 'Apache-2.0',
  keywords: [
    'aws',
    'cdk',
    'aws-cdk',
    'docker',
    'trivy',
    'ecs',
    'ecr',
    'fargate',
    'container',
    'security',
  ],
  gitignore: ['*.js', '*.d.ts', 'cdk.out/'],
  bin: {
    0: './assets',
  },
  githubOptions: {
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: ['feat', 'fix', 'chore', 'docs', 'test', 'refactor', 'ci'],
      },
    },
  },
  workflowNodeVersion: '18.18.0',
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.tsconfigDev.addInclude('assets/lambda/**/*.ts');
project.setScript('cdk', 'cdk');
project.setScript('integ:deploy', "cdk deploy --app='./test/integ.js'");
project.setScript('integ:destroy', "cdk destroy --app='./test/integ.js'");
project.projectBuild.compileTask.prependExec(
  'yarn install --non-interactive --frozen-lockfile && yarn build',
  {
    cwd: 'assets/lambda',
  },
);
project.synth();
