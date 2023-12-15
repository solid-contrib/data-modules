# Bookmarks Data Module using vanilla JavaScript

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
const result: IBookmark[] = await Bookmark.getAll(session);
```
the `getAll` method will return an array of IBookmark, in case there are no bookmarks it will return an empty array.
```typescript
const result: IBookmark | undefined  = await Bookmark.get("<pk>", session);
```
the `get` method will return an IBookmark, in case there is no bookmark it will return `undefined`.
```typescript
const result: boolean  = await Bookmark.delete("<pk>", session);
```
the `delete` method will return a boolean indicating if the bookmark was deleted.
```typescript
const result: boolean  = await Bookmark.create(payload: ICreateBookmark, session);
```
the `create` method will return a boolean indicating if the bookmark was created.
```typescript
const result: IBookmark | undefined = await Bookmark.update("<pk>", payload: IUpdateBookmark, session);
```
the `update` method will return an IBookmark, in case there is no bookmark it will return `undefined`.

- pk indicates the primary key of the bookmark, in this case its the url of the bookmark
- payload is an object containing the fields of the bookmark
- you need to pass the authenticated session to the methods, this session is obtained from the [auth.ts](https://github.com/solid-contrib/data-modules/blob/main/bookmarks/vanilla/demo/src/utils/auth.ts)
- session object can be obtained from:
    - `useSession` hook inside React Components, after `handleIncomingRedirect` hook is called.
    - `getDefaultSession` function inside vanilla js, after `handleIncomingRedirect` hook is called.
- a bare minimum session object should looks like:
```typescript
const session = {
    info:{
        webId: "some-webid"
    },
    fetch: {} // some authenticated fetch function
}
```


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
the [`Bookmark.getAll`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L72) takes an authenticated session to use for fetching the data.

the [`Bookmark.get`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L94) and [`Bookmark.delete`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L108) methods take the url of the bookmark as the primary key and an authenticated session.

the [`Bookmark.create`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L135) takes an object with fields: `label`, `topic` and `link`, `creator`, `created` and `updated` as the payload with an authenticated

the [`Bookmark.update`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L169) takes the `url` of the bookmark as primary key, then as a payload, it takes an object with fields: `label`, `topic` and `link`, `creator`, `created` and `updated` with an authenticated session.

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

The [Bookmak.getIndexUrl](https://github.com/solid-contrib/data-modules/blob/c717e683a27904d51fc602c2afa89d45b749293e/bookmarks/vanilla/src/modules/Bookmark.ts#L58C29-L58C29) is the entrypoint for the data module and typeIndex.
it checkes if typeIndex has a `solid:instance` or `solid:instanceContainer` registerd and returns the url of them as an array of strings.

see [TypeIndexHelper.getFromTypeIndex](https://github.com/solid-contrib/data-modules/blob/c717e683a27904d51fc602c2afa89d45b749293e/bookmarks/vanilla/src/utils/TypeIndexHelper.ts#L49C25-L49C41)

if there is a typeIndex document, it will read the whole dataset to get all `solid:instance` and `solid:instanceContainer` items and returns the url them as an array of strings.

in case there is not typeIndex document with the given access level `public or private`, it creates a default instance and register it inside typeIndex [TypeIndexHelper.registerInTypeIndex](https://github.com/solid-contrib/data-modules/blob/c717e683a27904d51fc602c2afa89d45b749293e/bookmarks/vanilla/src/modules/Bookmark.ts#L67) and returns the url of the instance as the result.


We also loop over all solid:instanceContainers to get all solid:instances inside them and merge them together into one array of urls [**See](https://github.com/solid-contrib/data-modules/blob/c717e683a27904d51fc602c2afa89d45b749293e/bookmarks/vanilla/src/utils/TypeIndexHelper.ts#L75-L83)

at the end it returns a unique array of urls of all `solid:instance` and `solid:instanceContainer` items.
[**See](https://github.com/solid-contrib/data-modules/blob/c717e683a27904d51fc602c2afa89d45b749293e/bookmarks/vanilla/src/utils/TypeIndexHelper.ts#L88C45-L88C45)
