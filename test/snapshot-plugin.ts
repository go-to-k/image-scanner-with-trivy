module.exports = {
  test: (val: unknown) => typeof val === 'string',
  serialize: (val: string) => {
    return `"${val
      .replace(/([A-Fa-f0-9]{64}.zip)/, 'HASH-REPLACED.zip')
      .replace(
        /\${AWS::AccountId}.dkr.ecr.\${AWS::Region}.\${AWS::URLSuffix}.*:[a-z0-9]*/,
        'registry.hub.docker.com/library/busybox',
      )}"`;
  },
};
