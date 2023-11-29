# Bookmarks Data Module using vanilla JavaScript

# How to use this module

[Please add docs about how this data module uses the type index etc.]

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


These are the methods implemented to deal with bookmarks
They will return a promise containing the JSON representation of the bookmark

```typescript

import { Session } from "@inrupt/solid-client-authn-browser";

const result: IBookmark[] = await Bookmarks.getAll(session: Session);
const result: IBookmark  = await Bookmarks.get("<pk>", session: Session);
const result: boolean  = await Bookmarks.delete("<pk>", session: Session);
const result: boolean  = await Bookmarks.create(payload: ICreateBookmark, session: Session);
const result: IBookmark  = await Bookmarks.update("<pk>", payload: IUpdateBookmark, session: Session);
```

- pk indicates the primary key of the bookmark, in this case its the url of the bookmark
- payload is an object containing the fields of the bookmark
- you need to pass the authenticated session to the methods, this session is obtained from the [auth.ts](https://github.com/solid-contrib/data-modules/blob/main/bookmarks/vanilla/demo/src/utils/auth.ts)


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


## methods
the [`Bookmark.getAll`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L72) takes an authenticated session to use for fetching the data.

the [`Bookmark.get`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L94) and [`Bookmark.delete`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L108) methods take the url of the bookmark as the primary key and an authenticated session.

the [`Bookmark.create`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L135) takes an object with fields: `label`, `topic` and `link`, `creator`, `created` and `updated` as the payload with an authenticated

the [`Bookmark.update`](https://github.com/solid-contrib/data-modules/blob/422cabb91085916e71c5610235f43fc483493d72/bookmarks/vanilla/src/modules/Bookmark.ts#L169) takes the `url` of the bookmark as primary key, then as a payload, it takes an object with fields: `label`, `topic` and `link`, `creator`, `created` and `updated` with an authenticated session.

schema:
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

