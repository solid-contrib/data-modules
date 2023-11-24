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
// TODO: install @rdfjs its not good to expect our dependencies to have it installed
import { namedNode } from "@rdfjs/data-model";
import { getThingAll, removeThing } from "@inrupt/solid-client";
import {
    BOOKMARK,
    DCTERMS,
    FOAF,
    RDF,
    RDFS
} from "@inrupt/vocab-common-rdf";


export type ICreateBookmark = {
    title: string
    link: string
    created?: string,
    updated?: string,
    creator?: string,
}

export type IUpdateBookmark = {
    title: string
    link: string
    creator?: string,
}

export type IBookmark = ICreateBookmark & { url: string }

export class Bookmark {

    /**
     * 
     * @param session Session
     * @returns string
     */
    public static async getIndexUrl(session: Session) {
        const pods = await getPodUrlAll(session.info.webId!, {
            fetch: session.fetch,
        });
        const bookmarksContainerUri = `${pods[0]}bookmarks/`;
        return `${bookmarksContainerUri}index.ttl`;
    }

    /**
     * 
     * @param session Session
     * @returns IBookmark[]
     */
    public static async getAll(session: Session) {
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
     * @returns IBookmark
     */
    public static async get(url: string, session: Session) {
        const ds = await getSolidDataset(url, { fetch: session.fetch });

        const thing = getThing(ds, url)

        return thing ? this.mapBookmark(thing) : undefined
    }

    /**
     * 
     * @param url string
     * @param session Session
     * @returns IBookmark[]
     */
    public static async delete(url: string, session: Session) {
        const indexUrl = await this.getIndexUrl(session);

        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

        const thing = getThing(ds, url);
        if (thing) {
            const updatedBookmarks = removeThing(ds, thing);
            const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedBookmarks, { fetch: session.fetch });
            return true
        } else {
            return false
        }
    };


    /**
     * 
     * @param title string
     * @param link string
     * @param session Session
     * @returns IBookmark[]
     */
    public static async create(payload: ICreateBookmark, session: Session) {

        const { title, link, created, creator, updated } = payload

        const indexUrl = await this.getIndexUrl(session);

        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

        let newBookmarkThing = createThing()

        newBookmarkThing = addStringNoLocale(newBookmarkThing, DCTERMS.title, title)
        newBookmarkThing = addStringNoLocale(newBookmarkThing, BOOKMARK.recalls, link)
        if (creator) newBookmarkThing = addNamedNode(newBookmarkThing, DCTERMS.creator, namedNode(creator))
        if (created) newBookmarkThing = addStringNoLocale(newBookmarkThing, DCTERMS.created, created)
        if (updated) newBookmarkThing = addStringNoLocale(newBookmarkThing, "http://purl.org/dc/terms/updated", updated)

        newBookmarkThing = addUrl(newBookmarkThing, RDF.type, BOOKMARK.Bookmark)

        const updatedBookmarkList = setThing(ds, newBookmarkThing);
        await saveSolidDatasetAt(indexUrl, updatedBookmarkList, { fetch: session.fetch });
        // TODO: also need return url of created bookmark
        return payload
    };


    /**
     * 
     * @param url string
     * @param title string
     * @param link string
     * @param session Session
     * @returns IBookmark[]
     */
    public static async update(url: string, payload: ICreateBookmark, session: Session) {
        const indexUrl = await this.getIndexUrl(session);
        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });
        let thing = getThing(ds, url)

        if (thing) {
            const { title, link, created, creator, updated } = payload

            thing = setStringNoLocale(thing, DCTERMS.title, title)
            thing = setStringNoLocale(thing, BOOKMARK.recalls, link)
            if (creator) thing = setNamedNode(thing, DCTERMS.creator, namedNode(creator))
            thing = setStringNoLocale(thing, "http://purl.org/dc/terms/updated", new Date().toISOString())

            thing = setUrl(thing, RDF.type, BOOKMARK.Bookmark)

            const updatedBookmarkList = setThing(ds, thing);
            await saveSolidDatasetAt(indexUrl, updatedBookmarkList, { fetch: session.fetch });

            return { url, ...payload }
        }

    };


    private static mapBookmark(thing: ThingPersisted): IBookmark {

        return {
            url: thing.url,
            title: this.mapTitle(thing),
            link: this.mapLink(thing),
            created: this.mapCreated(thing),
            updated: this.mapUpdated(thing),
            creator: this.mapCreator(thing),
        }
    }
    private static mapTitle(thing: ThingPersisted): string {
        return (
            getLiteral(thing, DCTERMS.title)?.value ??
            getLiteral(thing, RDFS.label)?.value ?? ""
        );
    }
    private static mapLink(thing: ThingPersisted): string {
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

}
