# Ading a new dada-module to the repo:
the criteria is to match previus packages while adding a new package, e.g. they all need to have a `getAll` method.
- use one of the existing modules as an inspiration.
- Create a directory as the `module` name.
- Create a directory as the `lib/framework` name.
- Init a npm package.
- It should export a modules that has all CRUD operations inside, e.g. `get`, `getAll`, `create`, `delete`, `update`.

## new data-module tutorial (bookmarks with inrupt):
```bash
git clone git@github.com:solid-contrib/data-modules.git
cd data-modules
mkdir bookmarks/inrupt
cd bookmarks/inrupt
npm init -y
npm i typescript @types/node -D
npm i @inrupt/solid-client solid-typeindex-support
npx tsc --init
mkdir src/
mkdir src/
touch src/index.ts
```

tsconfig content:
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "module": "ESNext",
    "target": "es6",
    "allowJs": true,
    "declaration": true,
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "strict": true,
    "rootDir": "./",
    "baseUrl": "src",
    "stripInternal": true,

  },
  "types": ["node"],
  "include": ["src", "test", "__test__"],
  "exclude": ["node_modules", "**/test/*"]
}
```

```typescript
import { TypeIndexHelper } from "solid-typeindex-support";

export class Bookmark {
    private static async getIndexUrls(session): Promise<string[]> {
        const registeries = await TypeIndexHelper.getFromTypeIndex(session.info.webId!, session.fetch, true)

        if (!!registeries?.length) {
            return registeries
        } else {
            const pods = (await getPodUrlAll(session.info.webId!, { fetch: session.fetch }))[0];

            const baseURL = pods ? pods : session.info.webId?.split("/profile")[0]

            const defaultIndexUrl = `${baseURL}/bookmarks/index.ttl`;

            const defaultIndexDataset = await getSolidDataset(defaultIndexUrl, { fetch: session.fetch });

            if (!defaultIndexDataset) {
                await saveSolidDatasetAt(defaultIndexUrl, createSolidDataset(), { fetch: session.fetch });
            }

            await TypeIndexHelper.registerInTypeIndex(session.info.webId!, session.fetch, defaultIndexUrl, true)

            return [defaultIndexUrl];
        }
    }

    public static async create(payload: ICreateBookmark, session: Session): Promise<boolean> {

        const { title, link, creator, topic } = payload

        if (!isValidUrl(link)) throw new Error("link is not a valid URL")
        if (creator && !isValidUrl(creator)) throw new Error("creator is not a valid URL")


        const [indexUrl] = await this.getIndexUrls(session);

        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

        let newBookmarkThing = createThing()

        newBookmarkThing = addStringNoLocale(newBookmarkThing, DCTERMS.title, title)
        newBookmarkThing = addNamedNode(newBookmarkThing, BOOKMARK.recalls, namedNode(link))
        
        if (creator) newBookmarkThing = addNamedNode(newBookmarkThing, DCTERMS.creator, namedNode(creator))

        if (topic && isValidUrl(topic)) newBookmarkThing = addNamedNode(newBookmarkThing, BOOKMARK.hasTopic, namedNode(topic))
        if (topic && !isValidUrl(topic)) newBookmarkThing = addStringNoLocale(newBookmarkThing, BOOKMARK.hasTopic, topic)

        newBookmarkThing = addStringNoLocale(newBookmarkThing, DCTERMS.created, new Date().toISOString())
        newBookmarkThing = addStringNoLocale(newBookmarkThing, __DC_UPDATED, new Date().toISOString())

        newBookmarkThing = addUrl(newBookmarkThing, RDF.type, BOOKMARK.Bookmark)

        const updatedBookmarkList = setThing(ds, newBookmarkThing);
        const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedBookmarkList, { fetch: session.fetch });

        return updatedDataset ? true : false
    };

    // The rest of methods
}
```

