# Contribution

## Build for Code Bundle and API.md

```sh
yarn build
```

## Execute Unit Tests, Linting, and Integration Tests

```sh
yarn tsc -p tsconfig.dev.json

yarn test
```

## Update Snapshots in Integration Tests

```sh
yarn tsc -p tsconfig.dev.json

yarn integ --update-on-failed
```
