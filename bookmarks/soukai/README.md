# Bookmarks Data Module for Soukai

## Development
```
git clone https://github.com/solid-contrib/data-modules
cd data-modules
cd bookmarks/soukai
npm install
npm run test
```

## Demo app
Assuming you just ran the 'development' steps above and are now in the bookmarks/soukai folder.
```
cd demo
node test.mjs
```

## Explanation of the demo app
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
