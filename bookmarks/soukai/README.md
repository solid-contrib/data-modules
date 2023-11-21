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
npm install
npm run build
cd demo
npm install
npm run dev
```

## Explanation of the demo app
First of all, the login and booting is handled by [`src/utils.js`](https://github.com/solid-contrib/data-modules/blob/add-bookmarks/bookmarks/soukai/demo/src/utils.ts).

Once up and running, the demo app [instantiates the BookmarkFactory](https://github.com/solid-contrib/data-modules/blob/87215df31c1fb9177f32d1f860f2e0d496fc3cc8/bookmarks/soukai/demo/src/components/Bookmarks.tsx#L35) inside a React `useEffect` callback. After that, it simply calls `factory.getAll()` to retrieve all bookmarks that are discoverable through
the private type index on the Solid pod of the currently authenticated user. The `setBookmarks(bookmarks)` call hands the fetched items over to React.

The [`factory.get`](https://github.com/solid-contrib/data-modules/blob/87215df31c1fb9177f32d1f860f2e0d496fc3cc8/bookmarks/soukai/demo/src/components/Bookmarks.tsx#L141) and [`factory.remove`](https://github.com/solid-contrib/data-modules/blob/87215df31c1fb9177f32d1f860f2e0d496fc3cc8/bookmarks/soukai/demo/src/components/Bookmarks.tsx#L180) functions take the `url` of a bookmark as the primary key.
 
And [`factory.create`](https://github.com/solid-contrib/data-modules/blob/87215df31c1fb9177f32d1f860f2e0d496fc3cc8/bookmarks/soukai/demo/src/components/Bookmarks.tsx#L95)
takes an object with three string fields: `label`, `topic` and `link`.

And finally there is [`factory.update`](https://github.com/solid-contrib/data-modules/blob/87215df31c1fb9177f32d1f860f2e0d496fc3cc8/bookmarks/soukai/demo/src/components/Bookmarks.tsx#L159) which takes the `url` as a primary key, and then an object with the same three string fields as the second argument.

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
