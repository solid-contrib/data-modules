import {
    ThingPersisted,
    addNamedNode,
    addStringNoLocale,
    addUrl,
    createSolidDataset,
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
import { __DC_UPDATED, __crdt_createdAt, __crdt_updatedAt, __crdt_resource } from "../constants";
import { TypeIndexHelper } from "solid-typeindex-support";
import { isValidUrl } from "../utils";

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
     * Retrieves the index URLs for the session.
     *
     * @param {Session} session - The session object.
     * @return {Promise<string[]>} An array of index URLs.
     */
    public static async getIndexUrls(session: Session): Promise<string[]> {
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


    /**
     * Retrieves all bookmarks from the session.
     *
     * @param {Session} session - The session object.
     * @return {Promise<IBookmark[]>} A promise that resolves to an array of bookmarks.
     */
    public static async getAll(session: Session): Promise<IBookmark[]> {
        const indexUrls = await this.getIndexUrls(session);
        try {
            const all = indexUrls.map(async (indexUrl) => {
                const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });

                const things = getThingAll(ds)

                const bookmarks = await things.map(thing => this.mapBookmark(thing))

                const resources = bookmarks.filter(Bookmark => !Bookmark.url.endsWith('-metadata'))
                const metadatas = bookmarks.filter(Bookmark => Bookmark.url.endsWith('-metadata'))

                const responce = resources.map(bookmark => {
                    const metadata = metadatas.find((meta: any) => meta.resource === bookmark.url) as any

                    return {
                        ...bookmark,
                        ...(metadata?.created && { created: metadata.created }),
                        ...(metadata?.updated && { updated: metadata.updated }),
                    }
                })

                return responce
            })
            const allPromise = Promise.all([...all]);
            const values = (await allPromise).flat();
            return values;
        } catch (error) {
            return []
        }

    }


    /**
     * Retrieves a bookmark from the specified URL using the provided session.
     *
     * @param {string} url - The URL of the bookmark to retrieve.
     * @param {Session} session - The session object used for fetching the bookmark.
     * @return {Promise<IBookmark | undefined>} A promise that resolves to the retrieved bookmark, or undefined if no bookmark was found.
     */
    public static async get(url: string, session: Session): Promise<IBookmark | undefined> {
        const ds = await getSolidDataset(url, { fetch: session.fetch });

        const thing = getThing(ds, url)

        const meta = getThing(ds, `${url}-metadata`)

        const metadata = meta ? this.mapBookmark(meta) : undefined as any

        return thing ? {
            ...this.mapBookmark(thing),
            ...(metadata?.resource === thing?.url && metadata?.created && { created: metadata?.created }),
            ...(metadata?.resource === thing?.url && metadata?.updated && { updated: metadata?.updated }),
        } : undefined
    }

    /**
     * Deletes a resource from the specified URL using the provided session.
     *
     * @param {string} url - The URL of the resource to be deleted.
     * @param {Session} session - The session object used for authentication and fetching.
     * @returns {Promise<boolean>} - A Promise that resolves to true if the resource was successfully deleted, otherwise false.
     */
    public static async delete(url: string, session: Session): Promise<boolean> {
        const ds = await getSolidDataset(url, { fetch: session.fetch });

        const thing = getThing(ds, url);
        if (thing) {
            const updatedBookmarks = removeThing(ds, thing);
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
     * Creates a new bookmark with the given payload and session.
     *
     * @param {ICreateBookmark} payload - The payload object containing the bookmark details.
     * @param {Session} session - The session object for authentication.
     * @return {Promise<boolean>} A promise that resolves to a boolean value indicating whether the bookmark was created successfully.
     */
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


    /**
     * Updates a bookmark with the given payload in the specified URL.
     *
     * @param {string} url - The URL of the bookmark to update.
     * @param {IUpdateBookmark} payload - The payload containing the updated bookmark data.
     * @param {Session} session - The session object containing the fetch function for making HTTP requests.
     * @return {Promise<IBookmark | undefined>} A promise that resolves to the updated bookmark or undefined if the bookmark does not exist.
     */
    public static async update(url: string, payload: IUpdateBookmark, session: Session): Promise<IBookmark | undefined> {
        const ds = await getSolidDataset(url, { fetch: session.fetch });
        let thing = getThing(ds, url)

        if (thing) {
            const { title, link, creator, topic } = payload

            if (!isValidUrl(link)) throw new Error("link is not a valid URL")
            if (creator && !isValidUrl(creator)) throw new Error("creator is not a valid URL")

            thing = setStringNoLocale(thing, DCTERMS.title, title)
            thing = setNamedNode(thing, BOOKMARK.recalls, namedNode(link))
            if (creator) thing = setNamedNode(thing, DCTERMS.creator, namedNode(creator))

            if (topic && isValidUrl(topic)) thing = setNamedNode(thing, BOOKMARK.hasTopic, namedNode(topic))
            if (topic && !isValidUrl(topic)) thing = setStringNoLocale(thing, BOOKMARK.hasTopic, topic)

            thing = setStringNoLocale(thing, __DC_UPDATED, new Date().toISOString())

            thing = setUrl(thing, RDF.type, BOOKMARK.Bookmark)

            const updatedBookmarkList = setThing(ds, thing);
            await saveSolidDatasetAt(url, updatedBookmarkList, { fetch: session.fetch });

            return this.mapBookmark(thing)
        }

    };


    /**
     * Maps a ThingPersisted object to an IBookmark object.
     *
     * @param {ThingPersisted} thing - The ThingPersisted object to be mapped.
     * @return {IBookmark} - The mapped IBookmark object.
     */
    private static mapBookmark(thing: ThingPersisted): IBookmark {
        const url = thing.url
        const title = this.mapTitle(thing)
        const link = this.mapLink(thing)
        const topic = this.mapTopic(thing)
        const created = this.mapCreated(thing)
        const updated = this.mapUpdated(thing)
        const creator = this.mapCreator(thing)
        const resource = getNamedNode(thing, __crdt_resource)?.value
        return {
            url,
            title,
            link,
            ...(topic && { topic }),
            ...(created && { created }),
            ...(updated && { updated }),
            ...(creator && { creator }),
            ...(resource && { resource }),
        }
    }
    /**
     * Maps the title of a ThingPersisted object.
     *
     * @param {ThingPersisted} thing - The ThingPersisted object to map the title from.
     * @return {string} The mapped title of the ThingPersisted object, or an empty string if no title is found.
     */
    private static mapTitle(thing: ThingPersisted): string {
        return (
            getLiteral(thing, DCTERMS.title)?.value ??
            getLiteral(thing, RDFS.label)?.value ?? ""
        );
    }
    /**
     * Maps a link from a ThingPersisted object.
     *
     * @param {ThingPersisted} thing - The ThingPersisted object to map the link from.
     * @return {string} The mapped link.
     */
    private static mapLink(thing: ThingPersisted): string {
        // TODO: validate url
        // issue: https://github.com/solid-contrib/data-modules/issues/32
        return (
            getLiteral(thing, BOOKMARK.recalls)?.value ??
            getNamedNode(thing, BOOKMARK.recalls)?.value ?? ""
        );
    }
    /**
     * Maps the created date of a ThingPersisted object.
     *
     * @param {ThingPersisted} thing - The ThingPersisted object to map.
     * @return {string | undefined} The created date value, or undefined if not found.
     */
    private static mapCreated(thing: ThingPersisted): string | undefined {
        return getLiteral(thing, DCTERMS.created)?.value ?? getLiteral(thing, __crdt_createdAt)?.value
    }
    /**
     * Maps the updated value of a ThingPersisted object.
     *
     * @param {ThingPersisted} thing - The ThingPersisted object to map.
     * @return {string | undefined} The updated value of the ThingPersisted object, or undefined if not found.
     */
    private static mapUpdated(thing: ThingPersisted): string | undefined {
        return (
            getLiteral(thing, __DC_UPDATED)?.value ?? getLiteral(thing, __crdt_updatedAt)?.value
        );
    }
    /**
     * Maps the creator of a ThingPersisted object.
     *
     * @param {ThingPersisted} thing - The ThingPersisted object to map.
     * @return {string | undefined} - The creator value if found, otherwise undefined.
     */
    private static mapCreator(thing: ThingPersisted): string | undefined {
        return (
            getNamedNode(thing, DCTERMS.creator)?.value ??
            getNamedNode(thing, FOAF.maker)?.value
        );
    }
    /**
     * Maps the topic of a ThingPersisted.
     *
     * @param {ThingPersisted} thing - The ThingPersisted object to map the topic from.
     * @return {string | undefined} The mapped topic value, or undefined if it doesn't exist.
     */
    private static mapTopic(thing: ThingPersisted): string | undefined {
        return (
            getNamedNode(thing, BOOKMARK.hasTopic)?.value
        );
    }

}