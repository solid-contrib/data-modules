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
const result: boolean  = await Bookmarks.remove("<pk>", session: Session);
const result: IBookmark  = await Bookmarks.create(payload: ICreateBookmark, session: Session);
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

