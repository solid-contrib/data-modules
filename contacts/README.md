# Contacts - Solid Data Module

A data module to manage address books and contacts in Solid Pods in an
interoperable way.

## Specification

- [Client-to-Client specification](https://github.com/solid/contacts) for
  contacts.
- [Description of SolidOS de-facto standard](https://pdsinterop.org/conventions/addressbook/).


## Usage

### Installation

```shell
npm install rdflib @solid-data-modules/contacts-rdflib
```

### Quick start

```typescript
import {Fetcher, graph, UpdateManager} from "rdflib";
import {ContactsModule} from "@solid-data-module/contacts-rdflib";

// 1️⃣ create rdflib store, fetcher and updater as usual
const store = graph();
const fetcher = new Fetcher(
        store,
        // 💡 pass an authenticated fetch
        // to be able to access private resources*
        /* fetch: authenticatedFetch */
);
const updater = new UpdateManager(store);

// 2️⃣ create the contacts module
return new ContactsModule({store, fetcher, updater});

// 3️⃣ use the module to interact with address books and contacts
const uri = await contacts.createAddressBook({
  container: "https://pod.example/alice/",
  name: "new address book"
})

const contactUri = await contacts.createNewContact({
  addressBook: uri,
  contact: {
      name: "Maurice Moss",
      email: "maurice.moss@reynholm-industries.example",
      phone: "0118-999-881-99-9119-725-3"
  },
});

const addressBook = await contacts.readAddressBook(uri)
console.log(addressBook)
```

### Example scripts

Executable example scripts how to use the module can be found in [./examples](./examples) folder. To run a script call it like

```shell
npm run build
node ./examples/read-address-book.mjs
```

The [development server](#development-server) needs to be running for this.

## Development

### Run tests

#### Unit and integration tests

```shell
npm test
```

#### End-to-end tests

The tests will start and stop their own solid server on port `3456`. This port needs to be available.

```shell
npm run test:e2e
```

The server is seeded with data from `src/e2e-tests/test-data` initially. After a test run you can investigate the pod file system at `src/e2e-tests/.test-data/<test-id>` where `<test-id>` is a random id generated for each run.

### Build

```shell
npm run build
```

### Development server

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
