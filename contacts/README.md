# Contacts - Solid Data Module

A data module to manage address books and contacts in Solid Pods in an
interoperable way.

## Specification

- [Client-to-Client specification](https://github.com/solid/contacts) for
  contacts.
- [Description of SolidOS de-facto standard](https://pdsinterop.org/conventions/addressbook/).

## Run tests

### Unit and integration tests

```shell
npm test
```

### End-to-end tests

The tests will start and stop their own solid server on port `3456`. This port needs to be available.

```shell
npm run test:e2e
```

The server is seeded with data from `src/e2e-tests/test-data` initially. After a test run you can investigate the pod file system at `src/e2e-tests/.test-data/<test-id>` where `<test-id>` is a random id generated for each run.

## Build

```shell
npm run build
```

## Development server

You can start a development solid server via:

```shell
npm run pod
```

This will seed an account and pod for test user alice. Find the credentials of
that account in [./dev-server/seed.json](./dev-server/seed.json)

To add some example data to this pod run

```shell
npm run pod:init
```

To start from scratch run

```shell
npm run pod:clean
```

and repeat from start of the section.

## Example scripts

Example scripts how to use the module can be found in [./examples](./examples) folder. To run a script call it like

```shell
npm run build
node ./examples/read-address-book.mjs
```

The development server needs to be running for this!