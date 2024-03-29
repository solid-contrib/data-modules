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
import { getThingAll, removeThing } from "@inrupt/solid-client";
import {
    AS,
    BOOKMARK,
    DCTERMS,
    FOAF,
    RDF,
    RDFS
} from "@inrupt/vocab-common-rdf";
import { namedNode } from '@rdfjs/data-model';
import { __DC_UPDATED, __crdt_createdAt, __crdt_updatedAt, __crdt_resource } from "../constants";
import { TypeIndexHelper } from "@rezasoltani/solid-typeindex-support";
import { isValidUrl, merge } from "../utils";

/**
 * Interface for the shape of a bookmark object that can be created.
 * Contains title, topic, link, and creator fields.
 * 
 */
export type ICreateBookmark = {
    title: string;
    topic?: string;
    link: string;
    creator?: string;
};

/**
 * Interface for the shape of a bookmark object that can be updated.
 * Contains title, topic, link, and creator fields.
 */
export type IUpdateBookmark = {
    title: string;
    topic?: string;
    link: string;
    creator?: string;
};

/**
 * Interface defining the shape of a bookmark object.
 * Extends ICreateBookmark and adds url, created, and updated fields.
 */
export type IBookmark = ICreateBookmark & {
    url: string;
    created?: string;
    updated?: string;
};

/**
 * The Bookmark class provides methods for CRUD over Bookmark resources in Solid.
 * @public
 */
export class Bookmark {


    /**
     * Gets the registry URLs for the bookmarks for the given webId.
     *
     * @param fetch - The fetch function to use for network requests
     * @param webId - The webId of the user to get bookmark registries for
     * @param defaultPrivateBookmarkDocUrl - Where to store the bookmarks if no type registration is found
     * @returns A promise resolving to an array of registry URL strings
     * @internal
     */
    public static async getAllBookmarkDocUrls(
        fetch: typeof globalThis.fetch,
        webId: string,
        defaultPrivateBookmarkDocUrl?: string
    ): Promise<string[]> {
        const privateEntriesOne = await TypeIndexHelper.getFromTypeIndex(webId!, BOOKMARK.Bookmark, fetch, true);
        const publicEntriesOne = await TypeIndexHelper.getFromTypeIndex(webId!, BOOKMARK.Bookmark, fetch, false);
        const instancesOne = merge(privateEntriesOne.instances, publicEntriesOne.instances);
        const privateEntriesTwo = await TypeIndexHelper.getFromTypeIndex(webId!, AS.Note, fetch, true);
        const publicEntriesTwo = await TypeIndexHelper.getFromTypeIndex(webId!, AS.Note, fetch, false);
        const instancesTwo = merge(privateEntriesTwo.instances, publicEntriesTwo.instances);
        const instances = merge(instancesOne, instancesTwo);
        // console.log(instances);
        if (!!instances.length) {
            return instances as string[];
        } else {
            const podToUse = (await getPodUrlAll(webId!, { fetch: fetch }))[0];

            const baseURL = podToUse ? podToUse : webId?.split("/profile")[0]

            defaultPrivateBookmarkDocUrl = `${baseURL}${defaultPrivateBookmarkDocUrl ?? '/bookmarks/index.ttl'}`;

            const defaultIndexDataset = await getSolidDataset(defaultPrivateBookmarkDocUrl, { fetch: fetch });

            if (!defaultIndexDataset) {
                await saveSolidDatasetAt(defaultPrivateBookmarkDocUrl, createSolidDataset(), { fetch: fetch });
            }

            await TypeIndexHelper.registerInTypeIndex(webId!, "bookmarks_registry", BOOKMARK.Bookmark, fetch, defaultPrivateBookmarkDocUrl, false, true)

            return [defaultPrivateBookmarkDocUrl];
        }
    }

    /**
     * Gets all bookmarks for the given user's webId.
     *
     * @param fetch - The fetch function to use for network requests.
     * @param webId - The user's webId.
     * @param defaultPrivateBookmarkDocUrl - The default container url
     * @returns A promise resolving to an array of the user's bookmarks.
     */
    public static async getAll(
        fetch: typeof globalThis.fetch,
        webId: string,
        defaultPrivateBookmarkDocUrl?: string,
    ): Promise<IBookmark[]> {
        const bookmarkDocUrls = await this.getAllBookmarkDocUrls(fetch, webId, defaultPrivateBookmarkDocUrl);
        try {
            const all = bookmarkDocUrls.map(async (bookmarkDocUrl) => {
                const ds = await getSolidDataset(bookmarkDocUrl, { fetch: fetch });
                // console.log('data set for', bookmarkDocUrl);
                const things = getThingAll(ds).filter(thing => {
                    // console.log('thing', thing, thing.predicates, thing.predicates[RDF.type], thing.predicates[RDF.type].namedNodes);
                    if (thing && thing.predicates && thing.predicates[RDF.type] && thing.predicates[RDF.type].namedNodes) {
                        const types = thing.predicates[RDF.type].namedNodes;
                        // console.log("thing types", types, JSON.stringify(types));
                        if (types && types.find((rdfType: string) => rdfType === BOOKMARK.Bookmark)) {
                            // console.log('found bookmark (type one)', thing.url);
                            return true;
                        }
                        if (types && types.find((rdfType: string) => rdfType === "http://www.w3.org/2002/01/bookmark#BookMark")) {
                            // console.log('found bookmark (type two)', thing.url);
                            return true;
                        }
                        if (types && types.find((rdfType: string) => rdfType === AS.Note)) {
                            // console.log('found bookmark (type three)', thing.url);
                            return true;
                        }
                        if (types && types.find((rdfType: string) => rdfType === "http://soukai-solid.com/crdt/Metadata")) {
                            // console.log('found Soukai metadata', thing.url);
                            return true;
                        }
                    }
                    // console.log('found non-bookmark', thing.url);
                    return false;
                });
                // console.log('things', things);
                const bookmarks = await things.map(thing => this.mapBookmark(thing))

                const resources = bookmarks.filter(Bookmark => !Bookmark.url.endsWith('-metadata'))
                const metadatas = bookmarks.filter(Bookmark => Bookmark.url.endsWith('-metadata'))

                const response = resources.map(bookmark => {
                    const metadata = metadatas.find((meta: any) => meta.resource === bookmark.url) as any

                    return {
                        ...bookmark,
                        ...(metadata?.created && { created: metadata.created }),
                        ...(metadata?.updated && { updated: metadata.updated }),
                    }
                })

                return response
            })
            const allPromise = Promise.all([...all]);
            const values = (await allPromise).flat();
            return values;
        } catch (error) {
            return []
        }

    }

    /**
     * Gets a bookmark by URL.
     *
     * @param url - The URL of the bookmark to get.
     * @param fetch - The fetch function to use for network requests.
     * @returns A promise resolving to the bookmark, if found, or undefined.
     */
    public static async get(
        url: string,
        fetch: typeof globalThis.fetch
    ): Promise<IBookmark | undefined> {
        const ds = await getSolidDataset(url, { fetch: fetch });

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
     * Deletes the bookmark at the given URL.
     *
     * @param url - The URL of the bookmark to delete.
     * @param fetch - The fetch function to use for network requests.
     * @returns A promise resolving to true if the bookmark was deleted, false otherwise.
     */
    public static async delete(
        url: string,
        fetch: typeof globalThis.fetch
    ): Promise<boolean> {
        const ds = await getSolidDataset(url, { fetch: fetch });

        const thing = getThing(ds, url);
        if (thing) {
            const updatedBookmarks = removeThing(ds, thing);
            const updatedDataset = await saveSolidDatasetAt(url, updatedBookmarks, { fetch: fetch });
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
     * Creates a new bookmark.
     *
     * @param payload - The bookmark data.
     * @param fetch - The fetch function.
     * @param webId - The user's WebID.
     * @param defaultPrivateBookmarkDocUrl - Doc to store the bookmark in if no type registration is foundj
     * @returns A promise resolving to true if the bookmark was created, false otherwise.
     */
    public static async create(
        payload: ICreateBookmark,
        fetch: typeof globalThis.fetch,
        webId: string,
        defaultPrivateBookmarkDocUrl?: string,
    ): Promise<boolean> {
        const { title, link, creator, topic } = payload;

        if (!isValidUrl(link)) throw new Error("link is not a valid URL");
        if (creator && !isValidUrl(creator))
            throw new Error("creator is not a valid URL");

        const [bookmarkDocUrl] = await this.getAllBookmarkDocUrls(fetch, webId, defaultPrivateBookmarkDocUrl);

        const ds = await getSolidDataset(bookmarkDocUrl, { fetch: fetch });

        let newBookmarkThing = createThing();

        newBookmarkThing = addStringNoLocale(
            newBookmarkThing,
            DCTERMS.title,
            title
        );
        newBookmarkThing = addNamedNode(
            newBookmarkThing,
            BOOKMARK.recalls,
            namedNode(link)
        );
        if (creator)
            newBookmarkThing = addNamedNode(
                newBookmarkThing,
                DCTERMS.creator,
                namedNode(creator)
            );

        if (topic && isValidUrl(topic))
            newBookmarkThing = addNamedNode(
                newBookmarkThing,
                BOOKMARK.hasTopic,
                namedNode(topic)
            );
        if (topic && !isValidUrl(topic))
            newBookmarkThing = addStringNoLocale(
                newBookmarkThing,
                BOOKMARK.hasTopic,
                topic
            );

        newBookmarkThing = addStringNoLocale(
            newBookmarkThing,
            DCTERMS.created,
            new Date().toISOString()
        );
        newBookmarkThing = addStringNoLocale(
            newBookmarkThing,
            __DC_UPDATED,
            new Date().toISOString()
        );

        newBookmarkThing = addUrl(newBookmarkThing, RDF.type, BOOKMARK.Bookmark);

        const updatedBookmarkList = setThing(ds, newBookmarkThing);
        const updatedDataset = await saveSolidDatasetAt(
            bookmarkDocUrl,
            updatedBookmarkList,
            { fetch: fetch }
        );

        return updatedDataset ? true : false;
    }

    /**
     * Updates a bookmark resource in a Solid pod by replacing its metadata
     * with the provided payload.
     *
     * @param url - The URL of the bookmark resource to update
     * @param payload - The updated bookmark metadata
     * @param fetch - The fetch function to use for network requests
     * @returns The updated bookmark object if successful, else undefined
     */
    public static async update(
        url: string,
        payload: IUpdateBookmark,
        fetch: typeof globalThis.fetch
    ): Promise<IBookmark | undefined> {
        const ds = await getSolidDataset(url, { fetch: fetch });
        let thing = getThing(ds, url);

        if (thing) {
            const { title, link, creator, topic } = payload;

            if (!isValidUrl(link)) throw new Error("link is not a valid URL");
            if (creator && !isValidUrl(creator))
                throw new Error("creator is not a valid URL");

            thing = setStringNoLocale(thing, DCTERMS.title, title);
            thing = setNamedNode(thing, BOOKMARK.recalls, namedNode(link));
            if (creator)
                thing = setNamedNode(thing, DCTERMS.creator, namedNode(creator));

            if (topic && isValidUrl(topic))
                thing = setNamedNode(thing, BOOKMARK.hasTopic, namedNode(topic));
            if (topic && !isValidUrl(topic))
                thing = setStringNoLocale(thing, BOOKMARK.hasTopic, topic);

            thing = setStringNoLocale(thing, __DC_UPDATED, new Date().toISOString());

            thing = setUrl(thing, RDF.type, BOOKMARK.Bookmark);

            const updatedBookmarkList = setThing(ds, thing);
            await saveSolidDatasetAt(url, updatedBookmarkList, { fetch: fetch });

            return this.mapBookmark(thing);
        }
    }

    /**
     * Maps a Solid dataset Thing to a Bookmark interface.
     *
     * @param thing - The Thing to map
     * @returns The mapped Bookmark interface
     * @internal
     */
    private static mapBookmark(thing: ThingPersisted): IBookmark {
        const url = thing.url;
        const title = this.mapTitle(thing);
        const link = this.mapLink(thing);
        const topic = this.mapTopic(thing);
        const created = this.mapCreated(thing);
        const updated = this.mapUpdated(thing);
        const creator = this.mapCreator(thing);
        const resource = getNamedNode(thing, __crdt_resource)?.value;
        const ret = {
            url,
            title,
            link,
            ...(topic && { topic }),
            ...(created && { created }),
            ...(updated && { updated }),
            ...(creator && { creator }),
            ...(resource && { resource }),
        };
        // console.log('mapped bookmark', thing.predicates, ret);
        return ret;
    }

    /**
     * Maps the title from a Solid dataset Thing.
     *
     * @param thing - The Thing to map
     * @returns The title as a string
     * @internal
     */
    private static mapTitle(thing: ThingPersisted): string {
        return (
            getLiteral(thing, DCTERMS.title)?.value ??
            getLiteral(thing, RDFS.label)?.value ??
            getLiteral(thing, AS.name)?.value ??
            ""
        );
    }

    /**
     * Maps the link URL from a Solid dataset Thing.
     *
     * @param thing - The Thing to map
     * @returns The link URL as a string
     * @internal
     */
    private static mapLink(thing: ThingPersisted): string {
        // console.log('mapping link', getLiteral(thing, BOOKMARK.recalls)?.value, )
        return (
            getLiteral(thing, BOOKMARK.recalls)?.value ??
            getNamedNode(thing, BOOKMARK.recalls)?.value ??
            getNamedNode(thing, AS.url)?.value ??
            ""
        );
    }

    /**
     * Maps the creation date from a Solid dataset Thing.
     *
     * @param thing - The Thing to map
     * @returns The creation date as a string, if available
     * @internal
     */
    private static mapCreated(thing: ThingPersisted): string | undefined {
        return (
            getLiteral(thing, DCTERMS.created)?.value ??
            getLiteral(thing, AS.published)?.value ??
            getLiteral(thing, __crdt_createdAt)?.value
        );
    }

    /**
     * Maps the update date from a Solid dataset Thing.
     *
     * @param thing - The Thing to map
     * @returns The update date as a string, if available
     * @internal
     */
    private static mapUpdated(thing: ThingPersisted): string | undefined {
        return (
            getLiteral(thing, __DC_UPDATED)?.value ??
            getLiteral(thing, __crdt_updatedAt)?.value
        );
    }

    /**
     * Maps the creator from a Solid dataset Thing.
     *
     * @param thing - The Thing to map
     * @returns The creator as a string, if available
     * @internal
     */
    private static mapCreator(thing: ThingPersisted): string | undefined {
        return (
            getNamedNode(thing, DCTERMS.creator)?.value ??
            getNamedNode(thing, AS.actor)?.value ??
            getNamedNode(thing, FOAF.maker)?.value
        );
    }

    /**
     * Maps the topic from a Solid dataset Thing.
     *
     * @param thing - The Thing to map
     * @returns The topic as a string, if available
     * @internal
     */
    private static mapTopic(thing: ThingPersisted): string | undefined {
        return getNamedNode(thing, BOOKMARK.hasTopic)?.value;
    }
}
