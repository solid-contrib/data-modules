import {
    buildThing,
    createThing,
    getLiteral,
    getPodUrlAll,
    getSolidDataset,
    getThing,
    saveSolidDatasetAt,
    setThing
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";

import { getThingAll, removeThing } from "@inrupt/solid-client";
import {
    BOOKMARK,
    DCTERMS,
    RDF
} from "@inrupt/vocab-common-rdf";


export interface IBookmark {
    url: string
    title: string
    link: string
}
export const getBookmarksIndexUrl = async (session: Session) => {
    const pods = await getPodUrlAll(session.info.webId!, {
        fetch: session.fetch,
    });
    const bookmarksContainerUri = `${pods[0]}bookmarks/`;
    return `${bookmarksContainerUri}index.ttl`;
};

export class Bookmark {
    constructor() { }
    public static async getAll(session: Session) {
        const indexUrl = await getBookmarksIndexUrl(session);
        try {
            const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

            const things = getThingAll(ds)

            return things.map(thing => {
                return {
                    url: thing.url,
                    title: getLiteral(thing, DCTERMS.title)?.value,
                    link: getLiteral(thing, BOOKMARK.recalls)?.value
                }
            }) as IBookmark[]

        } catch (error) {
            return []
        }
    }


    public static async get(url: string, session: Session) {
        const indexUrl = await getBookmarksIndexUrl(session);
        // const indexUrl = getSourceUrl(ds);

        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

        const thing = getThing(ds, url)

        if (thing) {
            return {
                url: thing.url,
                title: getLiteral(thing, DCTERMS.title)?.value,
                link: getLiteral(thing, BOOKMARK.recalls)?.value
            } as IBookmark
        }

        return undefined
    }

    public static async delete(url: string, session: Session) {
        const indexUrl = await getBookmarksIndexUrl(session);

        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

        const thing = getThing(ds, url);
        if (thing) {
            alert("sdh")
            const updatedBookmarks = removeThing(ds, thing);
            const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedBookmarks, { fetch: session.fetch });

            const things = getThingAll(updatedDataset)

            return things.map(thing => {
                return {
                    url: thing.url,
                    title: getLiteral(thing, DCTERMS.title)?.value,
                    link: getLiteral(thing, BOOKMARK.recalls)?.value
                }
            }) as IBookmark[]
        }
    };

    public static async create(title: string, link: string, session: Session) {

        const indexUrl = await getBookmarksIndexUrl(session);

        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

        const newBookmarkThing = buildThing(createThing())
            .addStringNoLocale(DCTERMS.title, title)
            .addStringNoLocale(BOOKMARK.recalls, link)
            .addUrl(RDF.type, BOOKMARK.Bookmark)
            .build();

        const updatedBookmarkList = setThing(ds, newBookmarkThing);
        const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedBookmarkList, { fetch: session.fetch });
        const things = getThingAll(updatedDataset)

        return things.map(thing => {
            return {
                url: thing.url,
                title: getLiteral(thing, DCTERMS.title)?.value,
                link: getLiteral(thing, BOOKMARK.recalls)?.value
            }
        }) as IBookmark[]

        // const indexUrl = await getBookmarksIndexUrl(session);
        // const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

        // let thing = createThing()

        // const bookmarkWithTitle = addStringNoLocale(thing, DCTERMS.title, title);
        // const bookmarkWithLink = addStringNoLocale(bookmarkWithTitle, BOOKMARK.recalls, link);

        // const bookmarkWithType = addUrl(bookmarkWithLink, RDF.type, BOOKMARK.Bookmark);

        // const updatedBookmarkList = setThing(ds, bookmarkWithType);

        // const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedBookmarkList, { fetch: session.fetch });

        // const things = getThingAll(updatedDataset)

        // return things.map(thing => {
        //     return {
        //         url: thing.url,
        //         title: getLiteral(thing, DCTERMS.title)?.value,
        //         link: getLiteral(thing, BOOKMARK.recalls)?.value
        //     }
        // }) as IBookmark[]
    };


    public static async update(url: string, session: Session) {
        const indexUrl = await getBookmarksIndexUrl(session);
        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });
        const thing = getThing(ds, url)

        if (thing) {
            let updatedBookmarkThing = buildThing(thing)
                .setStringNoLocale(DCTERMS.title, "updated")
                .setStringNoLocale(BOOKMARK.recalls, "http://goo.com")
                .setUrl(RDF.type, BOOKMARK.Bookmark)
                .build();

            const updatedBookmarkList = setThing(ds, updatedBookmarkThing);
            const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedBookmarkList, { fetch: session.fetch });
            const things = getThingAll(updatedDataset)

            return things.map(thing => {
                return {
                    url: thing.url,
                    title: getLiteral(thing, DCTERMS.title)?.value,
                    link: getLiteral(thing, BOOKMARK.recalls)?.value
                }
            }) as IBookmark[]
        }

    };

}
