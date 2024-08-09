# Chats - Solid Data Module for rdflib

A data module to manage chats in Solid Pods in an
interoperable way.

## Usage

### Installation via npm

```shell
npm install rdflib @solid-data-modules/chat-rdflib
```

### Usage in the brower via CDN

You can use the module directly in the browser (without any install or build step) by using the [esm.sh CDN](https://esm.sh/) and an import map:

```html
<script type="importmap">
  {
    "imports": {
      "@solid-data-modules/chat-rdflib": "https://esm.sh/@solid-data-modules/chat-rdflib",
      "rdflib": "https://esm.sh/rdflib"
    }
  }
</script>
<script type="module">
  import ChatsModuleRdfLib from "@solid-data-modules/chat-rdflib";
  import { Fetcher, graph, UpdateManager } from "rdflib";
  // ... use the module as described in the quick start
</script>
```

### Quick start

```typescript
import {Fetcher, graph, UpdateManager} from "rdflib";
import ChatsModuleRdfLib, { ChatsModule } from "@solid-data-modules/chat-rdflib";

// 1️⃣ create rdflib store, fetcher and updater as usual
const store = graph();
const fetcher = new Fetcher(
        store,
        // 💡 pass an authenticated fetch
        // to be able to access private resources*
        /* fetch: authenticatedFetch */
);
const updater = new UpdateManager(store);

// 2️⃣ create the chats module
const module: ChatsModule = new ChatsModuleRdfLib({store, fetcher, updater});

// 3️⃣ use the module to interact with chats

```

### Example scripts

Executable example scripts how to use the module can be found in [./examples](./examples) folder.

The [development server](#development-server) needs to be **running** and **initialized** for this.

After that you can run an example script like this:

```shell
npm run build
node ./examples/<some-example>.mjs
```

### Available features

For a description of all features available please take a look at the [module API documentation](https://solid-contrib.github.io/data-modules/chat-rdflib-api/interfaces/ChatsModule.html).

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

#### Start server

You can start a development solid server via:

```shell
npm run pod
```

This will seed an account and an _empty_ pod for test user alice. Find the credentials of
that account in [../dev-server/seed.json](./dev-server/seed.json)

#### Initialize example data

To add some example data to this pod run

```shell
npm run pod:init
```

To start from scratch run

```shell
npm run pod:clean
```

and repeat from start of the section.

## Funding

This project is funded through [NGI0 Entrust](https://nlnet.nl/entrust), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/SolidDataModules).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGI0_tag.svg" alt="NGI Zero Logo" width="20%" />](https://nlnet.nl/entrust)
