# Implemented conventions
Implemented conventions

- [Bookmark](https://pdsinterop.org/conventions/bookmark/)

## Usage

### Install and use the package
```bash
npm i soukai-solid-data-modules
```

### Import modules

```ts
import { bootModels, setEngine } from "soukai";
import { SolidEngine, bootSolidModels } from "soukai-solid";

import { Bookmark, BookmarkFactory } from "soukai-solid-data-modules";
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
