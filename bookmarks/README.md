# Implemented conventions
Implemented conventions

- [Bookmark](https://pdsinterop.org/conventions/bookmark/)

## Development
```
git clone https://github.com/solid-contrib/data-modules
cd data-modules
cd bookmarks
npm install
npm run test
```

## Usage
To use the Bookmarks data module, first decide if you want to use it on top of:
* inrupt-solid-client
* rdflib-js
* soukai
* LDO


### Usage with Soukai

To try this out, create a file `test.mjs` inside the root of your clone of the data-modules repo.
In there, write:
```js
import { bootModels, setEngine } from "soukai";
import { SolidEngine, bootSolidModels } from "soukai-solid";
import { Bookmark } from "./bookmarks/lib";
```

Now install the dependencies and run the file:
```
npm install soukai
npm install soukai-solid
node test.js
```

### Boot Engine
```ts
bootSolidModels();
bootModels({ Bookmark: Bookmark });
```

### get Factory instance (it's a singleton)
```ts
const factory = await BookmarkFactory.getInstance(
    {
        webId: userSession?.info.webId,
        fetch: userSession?.fetch,
        isPrivate: true,
    },
    "bookmarks/" // you can optionally pass a path to override typeRegistration
);
```

### use factory instance to CRUD over bookmarks
```ts
const bookmarks = await bookmarkFactory.getAll();
const bookmark  = await bookmarkFactory.get("<pk>");
const bookmark  = await bookmarkFactory.create({ label: "example", link: "https://example.com", hasTopic: "Topic" });
const bookmark  = await bookmarkFactory.remove("<pk>");
const bookmark  = await bookmarkFactory.update("<pk>", { label: "example", link: "https://example.com", hasTopic: "Topic"  });
```
