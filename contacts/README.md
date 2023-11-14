# Contacts - Solid Data Module

A data module to manage address books and contacts in Solid Pods in an
interoperable way.

## Specification

- [Client-to-Client specification](https://github.com/solid/contacts) for
  contacts.
- [Description of SolidOS de-facto standard](https://pdsinterop.org/conventions/addressbook/).

## Run tests

```shell
npm test
```

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