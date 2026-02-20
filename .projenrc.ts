import { awscdk } from 'projen';
import { NodePackageManager, TrailingComma, Transform } from 'projen/lib/javascript';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'go-to-k',
  authorAddress: '24818752+go-to-k@users.noreply.github.com',
  majorVersion: 2,
  cdkVersion: '2.178.1',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.9.0',
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
  gitignore: [
    '*.js',
    '*.d.ts',
    'cdk.out/',
    '.DS_Store',
    'test/cdk-integ.*.snapshot/**/*',
    '!test/integ.*.snapshot/**/*',
  ],
  githubOptions: {
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: ['feat', 'fix', 'chore', 'docs', 'test', 'refactor', 'ci'],
      },
    },
  },
  tsconfigDev: {
    compilerOptions: {},
    exclude: ['test/integ.*.snapshot', 'test/cdk-integ.*.snapshot'],
  },
  devDeps: ['@aws-cdk/integ-runner@2.178.1-alpha.0', '@aws-cdk/integ-tests-alpha@2.178.1-alpha.0'],
  packageManager: NodePackageManager.PNPM,
  workflowNodeVersion: '24',
  npmTrustedPublishing: true,
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.setScript('cdk', 'cdk');
project.setScript('build', 'tsc -p tsconfig.dev.json && npx projen build');
project.setScript('test', 'tsc -p tsconfig.dev.json && npx projen test');
project.setScript('test:watch', 'tsc -p tsconfig.dev.json && npx projen test:watch');
project.setScript('integ', 'tsc -p tsconfig.dev.json && integ-runner');
project.setScript('integ:update', 'pnpm integ --update-on-failed');
project.projectBuild.compileTask.prependExec('pnpm install --frozen-lockfile && pnpm build', {
  cwd: 'assets/lambda',
});
project.projectBuild.testTask.exec('pnpm integ');

project.synth();
