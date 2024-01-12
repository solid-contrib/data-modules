import {
    Fetcher,
    IndexedFormula,
    Namespace,
    UpdateManager,
    graph,
    lit,
    namedNode,
    st,
    sym
} from "rdflib";
import { v4 as uuid } from 'uuid';

// Namespaces
const DCT = Namespace("http://purl.org/dc/terms/");
const BOOKMARK = Namespace("http://www.w3.org/2002/01/bookmark#");
// const RDF = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
// const VCARD = Namespace("http://www.w3.org/2006/vcard/ns#");
// const DC = Namespace("http://purl.org/dc/elements/1.1/");

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


    async getAll(containerUri: string): Promise<any> {
        const container = this.store.sym(`${containerUri}#it`);
        const res = await this.fetcher.load(container);
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

    async create(containerUri: string, { title, link, topic, creator, recalls }: any) {
        const id = uuid();
        const uri = `${containerUri}${id}/index.ttl#this`;
        // const nameEmailIndexUri = `${containerUri}${id}/people.ttl`;
        // const groupIndexUri = `${containerUri}${id}/groups.ttl`;

        const insertions = [
            st(sym(uri), sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), BOOKMARK("Bookmark"), sym(uri).doc()),
            st(sym(uri), DCT("title"), lit(title), sym(uri).doc()),
            st(sym(uri), DCT("hasTopic"), namedNode(topic), sym(uri).doc()),
            st(sym(uri), DCT("recalls"), namedNode(link), sym(uri).doc()),
            st(sym(uri), DCT("creator"), namedNode(creator), sym(uri).doc()),
            st(sym(uri), DCT("created"), lit((new Date().toISOString())), sym(uri).doc()),
            st(sym(uri), DCT("updated"), lit((new Date().toISOString())), sym(uri).doc()),
        ];

        const operation = {
            uri,
            deletions: [],
            insertions,
            // filesToCreate: [{ uri: nameEmailIndexUri }, { uri: groupIndexUri }],
        };
        await this.updater.updateMany(operation.deletions, operation.insertions);
        // operation.filesToCreate.map((file) => this.createEmptyTurtleFile(file.uri));
        return operation.uri;
    }

    // private async createEmptyTurtleFile(uri: string) {
    //     this.fetcher.webOperation("PUT", uri, { contentType: "text/turtle" });
    // }
}

// export const __forClass = "http://www.w3.org/ns/solid/terms#forClass"
// export const __Bookmark = 'http://www.w3.org/2002/01/bookmark#Bookmark'

// export const __privateTypeIndex = "http://www.w3.org/ns/solid/terms#privateTypeIndex"
// export const __publicTypeIndex = "http://www.w3.org/ns/solid/terms#publicTypeIndex"

// export const __solidTypeRegistration = "http://www.w3.org/ns/solid/terms#TypeRegistration"
// export const __solidTypeIndex = "http://www.w3.org/ns/solid/terms#TypeIndex"
// export const __solidUnlistedDocument = "http://www.w3.org/ns/solid/terms#UnlistedDocument"

// export const __solid_instance = "http://www.w3.org/ns/solid/terms#instance"
// export const __solid_instance_container = "http://www.w3.org/ns/solid/terms#instanceContainer"
// export const __DC_UPDATED = "http://purl.org/dc/terms/updated"

// export const __crdt_resource = "http://soukai-solid.com/crdt/resource"
// export const __crdt_createdAt = "http://soukai-solid.com/crdt/createdAt"
// export const __crdt_updatedAt = "http://soukai-solid.com/crdt/updatedAt"

// export const __schemaPerson = "http://schema.org/Person";
// export const __foafPerson = "http://xmlns.com/foaf/0.1/Person";