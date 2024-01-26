# Bookmarks Data Module using vanilla JavaScript

See [Docs](https://solid-contrib.github.io/data-modules/bookmarks-vanilla/index.html) for more information about this module.
# How to use this module

install it as a dependency to you application
```bash
npm i @solid-data-modules/bookmarks-vanilla
```

import the module
```typescript
import { Bookmark } from "@solid-data-modules/bookmarks-vanilla"
```

use it to work with bookmarks

```typescript
const result: IBookmark[] = await Bookmark.getAll(session.fetch, session.info.webId, "<defaultRegistryUrl>");
```
the `getAll` method will return an array of IBookmark, in case there are no bookmarks it will return an empty array.
```typescript
const result: IBookmark | undefined  = await Bookmark.get("url", session.fetch);
```
the `get` method will return an IBookmark, in case there is no bookmark it will return `undefined`.
```typescript
const result: boolean  = await Bookmark.delete("url", session.fetch);
```
the `delete` method will return a boolean indicating if the bookmark was deleted.
```typescript
const result: boolean  = await Bookmark.create(payload: ICreateBookmark, session.fetch, session.info.webId, "<defaultRegistryUrl>");
```
the `create` method will return a boolean indicating if the bookmark was created.
```typescript
const result: IBookmark | undefined = await Bookmark.update("url", payload: IUpdateBookmark, session.fetch);
```
the `update` method will return an IBookmark, in case there is no bookmark it will return `undefined`.

- `url` indicates the primary key of the bookmark, (IRI in the RDF)
- `defaultRegistryUrl` indicates the default registry url in case you want to specify, and it's optional, and obviously it has to be a valid URL, the default value is `/bookmarks/index.ttl`
- payload is an object containing the fields of the bookmark
- you need to pass the authenticated fetch and a webId to the methods, these values is obtained from the [auth.ts](https://github.com/solid-contrib/data-modules/blob/main/bookmarks/vanilla/demo/src/utils/auth.ts) in the demo app.
- session object can be obtained from:
    - `useSession` hook inside React Components, after `handleIncomingRedirect` hook is called.
    - `getDefaultSession` function inside vanilla js, after `handleIncomingRedirect` hook is called.



## Types

```typescript
type ICreateBookmark = {
    title: string
    topic?: string
    link: string
    creator?: string,
}

type IUpdateBookmark = {
    title: string
    topic?: string
    link: string
    creator?: string,
}

type IBookmark = ICreateBookmark & {
    url: string
    created?: string
    updated?: string
}
```


## Development

```bash
git clone https://github.com/solid-contrib/data-modules
cd data-modules
cd bookmarks/vanilla
npm install
npm run test
```

## Demo app

Assuming you just ran the 'development' steps above and are now in the bookmarks/vanilla folder.

```bash
npm run build
cd demo
npm install
npm run dev
```

## Explanation of the demo app

The login is handled by [`src/utils/auth.ts`](https://github.com/solid-contrib/data-modules/blob/main/bookmarks/vanilla/demo/src/utils/auth.ts).

Once its completed the auth proccess it will redirect to the redirect url, and from there it will use Bookmark static methods to CRUD the bookmarks in [Bookmarks component](https://github.com/solid-contrib/data-modules/blob/main/bookmarks/vanilla/demo/src/components/Bookmarks/Bookmarks.tsx)


## methods
the [`Bookmark.getAll`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L72) takes an authenticated fetch to use for fetching the data as well as a webId of the logedin user. also it takes the `defaultRegistryUrl` in case you want to store the bookmarks in specific directory.

the [`Bookmark.get`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L94) and [`Bookmark.delete`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L108) methods take the url of the bookmark as the primary key and an authenticated fetch.

the [`Bookmark.create`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L135) takes an object with fields: `label`, `topic` and `link`, `creator`, `created` and `updated` as the payload with an authenticated fetch and a webId. also it takes the `defaultRegistryUrl` in case you want to store the bookmarks in specific directory.

the [`Bookmark.update`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L169) takes the `url` of the bookmark as primary key, then as a payload, it takes an object with fields: `label`, `topic` and `link`, `creator`, `created` and `updated` with an authenticated fetch.

the [`Bookmark.delete`](https://github.com/solid-contrib/data-modules/blob/b4e69e20481f2590b4bd1a1d17b192e2e6b4514e/bookmarks/vanilla/src/modules/Bookmark.ts#L164) takes the `url` of the bookmark as primary key, with an authenticated fetch.

Schema:
label: any string value should be fine (required)
link: link should be a valid URL e.g. starts with http or https (required)
topic: topic can be both a string or a link to a topic e.g. "tipoc title" | "http://example.com/topic" (optional)
creator: a URL to the creator e.g. WebID (optional)
created: DateTime string e.g. "2023-10-21T14:16:16Z" (optional)
updated: DateTime string e.g. "2023-10-21T14:16:16Z" (optional)


## example payload

```json
{
    "label": "label",
    "topic": "http://example.com/topic", // it also works with strings "topic title"
    "link": "http://example.com",
    "creator": "https://michielbdejong.solidcommunity.net/profile/card#me",
    "created": "2023-10-21T14:16:16Z",
    "updated": "2023-10-21T14:16:16Z"
}
```

# typeIndex Support

The [Bookmak.getRegistryUrls](https://github.com/solid-contrib/data-modules/blob/f9216b7a499bef5d962f3a011b95ec3ea44e1e56/bookmarks/vanilla/src/modules/Bookmark.ts#L80C30-L80C30) is the entrypoint for the data module and typeIndex.
it checkes if typeIndex has a `solid:instance` or `solid:instanceContainer` registerd and returns the url of them as an array of strings. also it takes the `defaultRegistryUrl` in case you want to store the bookmarks in specific directory.

see [Solid Typeindex Support](https://github.com/pondersource/solid-typeindex-support) for more information on typeindex support

