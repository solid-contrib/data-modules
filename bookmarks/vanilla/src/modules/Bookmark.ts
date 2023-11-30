import {
    ThingPersisted,
    addNamedNode,
    addStringNoLocale,
    addUrl,
    buildThing,
    createThing,
    getLiteral,
    getNamedNode,
    getPodUrlAll,
    getSolidDataset,
    getThing,
    saveSolidDatasetAt,
    setNamedNode,
    setStringNoLocale,
    setThing,
    setUrl
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { namedNode } from '@rdfjs/data-model'
import { getThingAll, removeThing } from "@inrupt/solid-client";
import {
    BOOKMARK,
    DCTERMS,
    FOAF,
    RDF,
    RDFS
} from "@inrupt/vocab-common-rdf";

// TODO: will put it to constants file created in https://github.com/solid-contrib/data-modules/blob/fix/issue%2321/bookmarks/vanilla/src/constants.ts
// or maybe use DCTERMS.modified
const DC_UPDATED = "http://purl.org/dc/terms/updated"

export type ICreateBookmark = {
    title: string
    topic?: string
    link: string
    creator?: string,
}

export type IUpdateBookmark = {
    title: string
    topic?: string
    link: string
    creator?: string,
}

export type IBookmark = ICreateBookmark & {
    url: string
    created?: string
    updated?: string
}

export class Bookmark {

    /**
     * 
     * @param session Session
     * @returns string
     */
    public static async getIndexUrl(session: Session): Promise<string> {
        const pods = await getPodUrlAll(session.info.webId!, {
            fetch: session.fetch,
        });
        const bookmarksContainerUri = `${pods[0]}bookmarks/`;
        return `${bookmarksContainerUri}index.ttl`;
    }

    /**
     * 
     * @param session Session
     * @returns Promise<IBookmark[]>
     */
    public static async getAll(session: Session): Promise<IBookmark[]> {
        const indexUrl = await this.getIndexUrl(session);
        try {
            const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

            const things = getThingAll(ds)

            const bookmarks = things.map(thing => this.mapBookmark(thing))

            return bookmarks

        } catch (error) {
            return []
        }
    }

    /**
     * 
     * @param url string
     * @param session Session
     * @returns Promise<IBookmark | undefined>
     */
    public static async get(url: string, session: Session): Promise<IBookmark | undefined> {
        const ds = await getSolidDataset(url, { fetch: session.fetch });

        const thing = getThing(ds, url)

        return thing ? this.mapBookmark(thing) : undefined
    }

    /**
     * 
     * @param url string
     * @param session Session
     * @returns Promise<boolean>
     */
    public static async delete(url: string, session: Session): Promise<boolean> {
        const indexUrl = await this.getIndexUrl(session);

        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

        const thing = getThing(ds, url);
        if (thing) {
            const updatedBookmarks = removeThing(ds, thing);
            const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedBookmarks, { fetch: session.fetch });
            if (updatedDataset) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    };


    /**
     * 
     * @param payload ICreateBookmark
     * @param session Session
     * @returns Promise<boolean>
     */
    public static async create(payload: ICreateBookmark, session: Session): Promise<boolean> {

        const { title, link, creator, topic } = payload

        const indexUrl = await this.getIndexUrl(session);

        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

        let newBookmarkThing = createThing()

        newBookmarkThing = addStringNoLocale(newBookmarkThing, DCTERMS.title, title)
        newBookmarkThing = addStringNoLocale(newBookmarkThing, BOOKMARK.recalls, link)
        if (creator) newBookmarkThing = addNamedNode(newBookmarkThing, DCTERMS.creator, namedNode(creator))
        if (topic) newBookmarkThing = addNamedNode(newBookmarkThing, BOOKMARK.hasTopic, namedNode(topic))
        newBookmarkThing = addStringNoLocale(newBookmarkThing, DCTERMS.created, new Date().toISOString())
        newBookmarkThing = addStringNoLocale(newBookmarkThing, DC_UPDATED, new Date().toISOString())

        newBookmarkThing = addUrl(newBookmarkThing, RDF.type, BOOKMARK.Bookmark)

        const updatedBookmarkList = setThing(ds, newBookmarkThing);
        const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedBookmarkList, { fetch: session.fetch });

        return updatedDataset ? true : false
    };


    /**
     * 
     * @param payload IUpdateBookmark
     * @param session Session
     * @returns Promise<IBookmark | undefined>
     */
    public static async update(url: string, payload: IUpdateBookmark, session: Session): Promise<IBookmark | undefined> {
        const indexUrl = await this.getIndexUrl(session);
        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });
        let thing = getThing(ds, url)

        if (thing) {
            const { title, link, creator, topic } = payload

            thing = setStringNoLocale(thing, DCTERMS.title, title)
            thing = setStringNoLocale(thing, BOOKMARK.recalls, link)
            if (creator) thing = setNamedNode(thing, DCTERMS.creator, namedNode(creator))
            if (topic) thing = setNamedNode(thing, BOOKMARK.hasTopic, namedNode(topic))
            thing = setStringNoLocale(thing, DC_UPDATED, new Date().toISOString())

            thing = setUrl(thing, RDF.type, BOOKMARK.Bookmark)

            const updatedBookmarkList = setThing(ds, thing);

            await saveSolidDatasetAt(indexUrl, updatedBookmarkList, { fetch: session.fetch });

            return this.mapBookmark(thing)
        }

    };


    private static mapBookmark(thing: ThingPersisted): IBookmark {
        const url = thing.url
        const title = this.mapTitle(thing)
        const link = this.mapLink(thing)
        const topic = this.mapTopic(thing)
        const created = this.mapCreated(thing)
        const updated = this.mapUpdated(thing)
        const creator = this.mapCreator(thing)

        return {
            url,
            title,
            link,
            ...(topic && { topic }),
            ...(created && { created }),
            ...(updated && { updated }),
            ...(creator && { creator }),
        }
    }
    private static mapTitle(thing: ThingPersisted): string {
        return (
            getLiteral(thing, DCTERMS.title)?.value ??
            getLiteral(thing, RDFS.label)?.value ?? ""
        );
    }
    private static mapLink(thing: ThingPersisted): string {
        // TODO: validate url
        // issue: https://github.com/solid-contrib/data-modules/issues/32
        return (
            getLiteral(thing, BOOKMARK.recalls)?.value ??
            getNamedNode(thing, BOOKMARK.recalls)?.value ?? ""
        );
    }
    private static mapCreated(thing: ThingPersisted): string | undefined {
        return getLiteral(thing, DCTERMS.created)?.value
    }
    private static mapUpdated(thing: ThingPersisted): string | undefined {
        return (
            getLiteral(thing, "http://purl.org/dc/terms/updated")?.value
        );
    }
    private static mapCreator(thing: ThingPersisted): string | undefined {
        return (
            getNamedNode(thing, DCTERMS.creator)?.value ??
            getNamedNode(thing, FOAF.maker)?.value
        );
    }
    private static mapTopic(thing: ThingPersisted): string | undefined {
        return (
            getNamedNode(thing, BOOKMARK.hasTopic)?.value
        );
    }

}
