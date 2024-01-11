import {
    Fetcher,
    IndexedFormula,
    Namespace,
    UpdateManager,
    graph
} from "rdflib";

const DCT = Namespace("http://purl.org/dc/terms/");
const BOOKMARK = Namespace("http://www.w3.org/2002/01/bookmark#");

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
        console.log("🚀 ~ Bookmark ~ getAll ~ res:", res)
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
}
