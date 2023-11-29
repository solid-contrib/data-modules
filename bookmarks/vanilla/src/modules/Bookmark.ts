import {
    ThingPersisted,
    addNamedNode,
    addStringNoLocale,
    addUrl,
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
import { getThingAll, removeThing } from "@inrupt/solid-client";
import {
    BOOKMARK,
    DCTERMS,
    FOAF,
    RDF,
    RDFS
} from "@inrupt/vocab-common-rdf";
import { namedNode } from '@rdfjs/data-model';
import { TypeIndexHelper } from "../utils/TypeIndexHelper";


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
    public static async getIndexUrl(session: Session) {
        const pods = await getPodUrlAll(session.info.webId!, { fetch: session.fetch });
        const defaultIndexUrl = `${pods[0]}bookmarks/index.ttl`;

        const bookmarkRegisteries = await TypeIndexHelper.getFromTypeIndex(session, defaultIndexUrl, true)
        if (bookmarkRegisteries) {
            // inrupt getSolidDataset takes a full url to turtle file like https://example.com/bookmarks/index.ttl
            const { instanceContainers, instances } = bookmarkRegisteries

            if (!!instances.length) {
                return instances
            }
            if (!!instanceContainers.length) {
                // return instanceContainers[0]
            }

            // TODO: create registeries
            // TypeIndexHelper

            // TODO: return all instances
        } else {
            // TODO: create registeries
        }
        return [defaultIndexUrl];
    }

    /**
     * 
     * @param session Session
     * @returns IBookmark[]
     */
    public static async getAll(session: Session) {
        const indexUrls = await this.getIndexUrl(session);
        try {
            const all = indexUrls.map(async (indexUrl) => {
                const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

                const things = getThingAll(ds)

                const bookmarks = await things.map(thing => this.mapBookmark(thing))

                return bookmarks
            })
            const allPromise = Promise.all([...all]);
            const values = (await allPromise).flat();
            return values;
        } catch (error) {
            console.log("🚀 ~ file: Bookmark.ts:104 ~ Bookmark ~ getAll ~ error:", error)
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
     * @returns boolean
     */
    public static async delete(url: string, session: Session) {
        // const [indexUrl] = await this.getIndexUrl(session);

        const ds = await getSolidDataset(url, { fetch: session.fetch });

        const thing = getThing(ds, url);
        if (thing) {
            const updatedBookmarks = removeThing(ds, thing);
            // TODO: we can also split url with # to path exact datasetURL
            // but compatibility with other frameworks need more considiration
            // e.g. inrub url: https://solid-dm.solidcommunity.net/bookmarks/index.ttl#d2d50f70-8eb0-40b6-9996-88c4a430a16d
            // e.g. soukai url: https://solid-dm.solidcommunity.net/bookmarks/d2d50f70-8eb0-40b6-9996-88c4a430a16d
            const updatedDataset = await saveSolidDatasetAt(url, updatedBookmarks, { fetch: session.fetch });
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
     * @param title string
     * @param link string
     * @param session Session
     * @returns IBookmark
     */
    public static async create(payload: ICreateBookmark, session: Session) {
        // TODO: check typeIndex

        const { title, link, creator, topic } = payload

        // default to create in first registery, so its fine to use 0th index
        const [indexUrl] = await this.getIndexUrl(session);

        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

        let newBookmarkThing = createThing()

        newBookmarkThing = addStringNoLocale(newBookmarkThing, DCTERMS.title, title)
        newBookmarkThing = addStringNoLocale(newBookmarkThing, BOOKMARK.recalls, link)
        if (creator) newBookmarkThing = addNamedNode(newBookmarkThing, DCTERMS.creator, namedNode(creator))
        if (topic) newBookmarkThing = addNamedNode(newBookmarkThing, BOOKMARK.hasTopic, namedNode(topic))
        newBookmarkThing = addStringNoLocale(newBookmarkThing, DCTERMS.created, new Date().toISOString())
        newBookmarkThing = addStringNoLocale(newBookmarkThing, "http://purl.org/dc/terms/updated", new Date().toISOString())

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
     * @returns IBookmark
     */
    public static async update(url: string, payload: IUpdateBookmark, session: Session) {
        // TODO: check typeIndex

        const ds = await getSolidDataset(url, { fetch: session.fetch });
        let thing = getThing(ds, url)

        if (thing) {
            const { title, link, creator, topic } = payload

            thing = setStringNoLocale(thing, DCTERMS.title, title)
            thing = setStringNoLocale(thing, BOOKMARK.recalls, link)
            if (creator) thing = setNamedNode(thing, DCTERMS.creator, namedNode(creator))
            if (topic) thing = setNamedNode(thing, BOOKMARK.hasTopic, namedNode(topic))
            thing = setStringNoLocale(thing, "http://purl.org/dc/terms/updated", new Date().toISOString())

            thing = setUrl(thing, RDF.type, BOOKMARK.Bookmark)

            const updatedBookmarkList = setThing(ds, thing);
            await saveSolidDatasetAt(url, updatedBookmarkList, { fetch: session.fetch });

            return { url, ...payload }
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