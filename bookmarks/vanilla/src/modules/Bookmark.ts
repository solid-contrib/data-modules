import {
    ThingPersisted,
    buildThing,
    createThing,
    getLiteral,
    getNamedNode,
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
    FOAF,
    RDF,
    RDFS
} from "@inrupt/vocab-common-rdf";


export interface IBookmark {
    url: string
    title: string
    link: string
    created?: string
    updated?: string
    creator?: string
    topic?: string
}

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

            const bookmarks = things.map(thing => {
                return {
                    url: thing.url,
                    title: getLiteral(thing, DCTERMS.title)?.value,
                    link: getLiteral(thing, BOOKMARK.recalls)?.value
                }
            }) as IBookmark[]

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
        const indexUrl = await this.getIndexUrl(session);

        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });
        console.log(getThingAll(ds))
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


    /**
     * 
     * @param title string
     * @param link string
     * @param session Session
     * @returns IBookmark[]
     */
    public static async create(title: string, link: string, session: Session) {

        const indexUrl = await this.getIndexUrl(session);

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
    };


    /**
     * 
     * @param url string
     * @param title string
     * @param link string
     * @param session Session
     * @returns IBookmark[]
     */
    public static async update(url: string, title: string, link: string, session: Session) {
        const indexUrl = await this.getIndexUrl(session);
        const ds = await getSolidDataset(indexUrl, { fetch: session.fetch });
        const thing = getThing(ds, url)

        if (thing) {
            let updatedBookmarkThing = buildThing(thing)
                .setStringNoLocale(DCTERMS.title, title)
                .setStringNoLocale(BOOKMARK.recalls, link)
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


    private static mapBookmark(thing: ThingPersisted): Bookmark {
        const obj: IBookmark = {
            url: thing.url,
            title: this.mapTitle(thing),
            link: this.mapLink(thing)
        };
        if (this.mapCreated(thing)) {
            obj.created = this.mapCreated(thing);
        }
        if (this.mapUpdated(thing)) {
            obj.updated = this.mapUpdated(thing);
        }
        if (this.mapCreator(thing)) {
            obj.creator = this.mapCreator(thing);
        }
        if (this.mapTopic(thing)) {
            obj.topic = this.mapTopic(thing);
        }
        return obj;
    }
    private static mapTitle(thing: ThingPersisted): string {
        return (
            getLiteral(thing, DCTERMS.title)?.value ??
            getLiteral(thing, RDFS.label)?.value ??
            ""
        );
    }
    private static mapLink(thing: ThingPersisted): string {
        return (
            getLiteral(thing, BOOKMARK.recalls)?.value ??
            getNamedNode(thing, BOOKMARK.recalls)?.value ??
            ""
        );
    }
    private static mapCreated(thing: ThingPersisted): string {
        return getLiteral(thing, DCTERMS.created)?.value ?? ""
    }
    private static mapUpdated(thing: ThingPersisted): string {
        return (
            getLiteral(thing, "http://purl.org/dc/terms/updated")?.value ??
            ""
        );
    }
    private static mapCreator(thing: ThingPersisted): string {
        return (
            getNamedNode(thing, DCTERMS.creator)?.value ??
            getNamedNode(thing, FOAF.maker)?.value ??
            ""
        );
    }
    private static mapTopic(thing: ThingPersisted): string {
        return (
            getNamedNode(thing, BOOKMARK.hasTopic)?.value ??
            ""
        );
    }

}
