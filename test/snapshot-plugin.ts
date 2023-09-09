module.exports = {
  test: (val: unknown) => typeof val === 'string',
  serialize: (val: string) => {
    return `"${val
      .replace(/([A-Fa-f0-9]{64}.zip)/, 'HASH-REPLACED.zip')
      .replace(/[0-9]{12}.dkr.ecr.*[0-9a-zA-Z]$/, 'registry.hub.docker.com/library/busybox')}"`;
  },
};
