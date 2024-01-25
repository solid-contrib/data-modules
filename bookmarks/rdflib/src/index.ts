import {
    Fetcher,
    IndexedFormula,
    Namespace,
    UpdateManager,
    graph,
    lit,
    namedNode,
    st,
    sym,
} from "rdflib";
import { v4 as uuid } from 'uuid';

const DCT = Namespace("http://purl.org/dc/terms/");
const TUR = Namespace("http://www.w3.org/ns/iana/media-types/text/turtle#");
const LDP = Namespace("http://www.w3.org/ns/ldp#");
const BOOKMARK = Namespace("http://www.w3.org/2002/01/bookmark#");
const __RdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"

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

type Args = {
    store?: IndexedFormula;
    fetcher: Fetcher;
    updater?: UpdateManager;
};

export class Bookmark {
    private readonly fetcher: Fetcher;
    private readonly store: IndexedFormula;
    private readonly updater: UpdateManager;

    constructor(config: Args) {
        this.store = config.store ?? graph();
        this.fetcher = config.fetcher;
        this.updater = config.updater ?? new UpdateManager(this.store);
    }


    async get(uri: string): Promise<any> {
        const doc = this.store.sym(`${uri}#it`);

        await this.fetcher.load(doc);

        let title = this.store.any(doc, DCT("title"))?.value;
        let created = this.store.any(doc, DCT("created"))?.value;
        let updated = this.store.any(doc, DCT("updated"))?.value;
        let hasTopic = this.store.any(doc, BOOKMARK("hasTopic"))?.value;
        let recalls = this.store.any(doc, BOOKMARK("recalls"))?.value;

        return {
            uri,
            title,
            created,
            updated,
            hasTopic,
            recalls,
        };
    }

    async create(containerUri: string, { title, link, topic, creator }: ICreateBookmark) {

        if (!isValidUrl(link)) throw new Error("link is not a valid URL");
        if (creator && !isValidUrl(creator)) throw new Error("creator is not a valid URL");

        const id = uuid();
        const uri = `${containerUri}${id}#this`;

        const insertions = [
            st(sym(uri), sym(__RdfType), BOOKMARK("Bookmark"), sym(uri).doc()),
            st(sym(uri), DCT("title"), lit(title), sym(uri).doc()),
            ...(topic ? [st(sym(uri), DCT("hasTopic"), namedNode(topic), sym(uri).doc())] : []),
            st(sym(uri), DCT("recalls"), namedNode(link), sym(uri).doc()),
            ...(creator ? [st(sym(uri), DCT("creator"), namedNode(creator), sym(uri).doc())] : []),
            st(sym(uri), DCT("created"), lit((new Date().toISOString())), sym(uri).doc()),
            st(sym(uri), DCT("updated"), lit((new Date().toISOString())), sym(uri).doc()),
        ];

        const operation = {
            uri,
            deletions: [],
            insertions,
        };
        await this.updater.updateMany(operation.deletions, operation.insertions);
        return operation.uri;
    }

    async update(uri: string, { title, link, topic, creator }: IUpdateBookmark) {

        const doc = this.store.sym(`${uri}#it`);
        const insertions = [
            ...(title ? [st(doc, DCT("title"), lit(title), doc)] : []),
            ...(topic ? [st(doc, DCT("hasTopic"), namedNode(topic), doc)] : []),
            ...(link ? [st(doc, DCT("recalls"), namedNode(link), doc)] : []),
            ...(creator ? [st(doc, DCT("creator"), namedNode(creator), doc)] : []),
            st(sym(uri), DCT("updated"), lit((new Date().toISOString())), sym(uri).doc()),
        ];
        const operation = {
            uri,
            deletions: [],
            insertions,
        };
        await this.updater.updateMany(operation.deletions, operation.insertions);
    }


    async delete(uri: string) {
        const doc = this.store.sym(`${uri}#it`);

        try {
            await this.fetcher.webOperation('DELETE', doc.uri)
        } catch (error) {
            let message = 'Unknown Error'
            if (error instanceof Error) message = error.message
            throw new Error(message ?? "Error Deleting resource");
        }
    }
}


/**
 * Checks if a given string is a valid URL.
 *
 * @param str - The string to check.
 * @returns True if str is a valid URL, false otherwise.
 * @internal
 */
export const isValidUrl = (str: string) => {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}