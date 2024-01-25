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
  NamedNode,
} from "rdflib";
import { v4 as uuid } from "uuid";

const DCT = Namespace("http://purl.org/dc/terms/");
const RDFS = Namespace("http://www.w3.org/2000/01/rdf-schema#");
const CRDT = Namespace("http://soukai-solid.com/crdt/");
const TUR = Namespace("http://www.w3.org/ns/iana/media-types/text/turtle#");
const LDP = Namespace("http://www.w3.org/ns/ldp#");
const BOOKMARK = Namespace("http://www.w3.org/2002/01/bookmark#");
const __RdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

const FOAF = Namespace("http://xmlns.com/foaf/0.1/");
const rdf = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const vcard = Namespace("http://www.w3.org/2006/vcard/ns#");
const dc = Namespace("http://purl.org/dc/elements/1.1/");

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

  async getAll(containerUrl: string): Promise<IBookmark[]> {
    try {
      const folder = this.store.sym(containerUrl); // NOTE: Ends in a slash

      await this.fetcher.load(folder);

      const files = this.store.match(folder, LDP("contains"), undefined, folder);

      const urls = files.map((f) => f.object.value);

      const allPromise = Promise.all(urls.map((url) => this.get(url)));

      const values = (await allPromise).flat();
      return values;

    } catch (error) {
      let message = "Error Listing resource";
      if (error instanceof Error) message = error.message;
      throw new Error(message);
    }
  }

  async get(url: string): Promise<IBookmark> {
    const doc = this.store.sym(`${url}#it`);

    await this.fetcher.load(doc);

    const title = this.mapTitle(doc);
    const created = this.mapCreated(doc);
    const updated = this.mapUpdated(doc);
    const topic = this.mapTopic(doc);
    const creator = this.mapCreator(doc);
    const link = this.mapLink(doc);

    return {
      url,
      title,
      link,
      ...(topic && { topic }),
      ...(created && { created }),
      ...(updated && { updated }),
      ...(creator && { creator }),
    };
  }

  async create(containerUrl: string, { title, link, topic, creator }: ICreateBookmark) {
    if (!isValidUrl(link)) throw new Error("link is not a valid URL");
    if (creator && !isValidUrl(creator)) throw new Error("creator is not a valid URL");

    const id = uuid();
    const uri = `${containerUrl}${id}#this`;

    const insertions = [
      st(sym(uri), sym(__RdfType), BOOKMARK("Bookmark"), sym(uri).doc()),
      st(sym(uri), DCT("title"), lit(title), sym(uri).doc()),
      ...(topic
        ? [st(sym(uri), DCT("hasTopic"), namedNode(topic), sym(uri).doc())]
        : []),
      st(sym(uri), DCT("recalls"), namedNode(link), sym(uri).doc()),
      ...(creator
        ? [st(sym(uri), DCT("creator"), namedNode(creator), sym(uri).doc())]
        : []),
      st(
        sym(uri),
        DCT("created"),
        lit(new Date().toISOString()),
        sym(uri).doc()
      ),
      st(
        sym(uri),
        DCT("updated"),
        lit(new Date().toISOString()),
        sym(uri).doc()
      ),
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

    const deletions = [
      ...(title ? [st(doc, DCT("title"), lit(title), doc)] : []),
      ...(topic ? [st(doc, DCT("hasTopic"), namedNode(topic), doc)] : []),
      ...(link ? [st(doc, DCT("recalls"), namedNode(link), doc)] : []),
      ...(creator ? [st(doc, DCT("creator"), namedNode(creator), doc)] : []),
      st(sym(uri), DCT("updated"), lit(new Date().toISOString()), sym(uri).doc()),
    ]

    const insertions = [
      ...(title ? [st(doc, DCT("title"), lit(title), doc)] : []),
      ...(topic ? [st(doc, DCT("hasTopic"), namedNode(topic), doc)] : []),
      ...(link ? [st(doc, DCT("recalls"), namedNode(link), doc)] : []),
      ...(creator ? [st(doc, DCT("creator"), namedNode(creator), doc)] : []),
      st(sym(uri), DCT("updated"), lit(new Date().toISOString()), sym(uri).doc()),
    ];
    const operation = {
      uri,
      deletions,
      insertions,
    };
    await this.updater.updateMany(operation.deletions, operation.insertions);
  }

  async delete(uri: string) {
    const doc = this.store.sym(`${uri}#it`);

    try {
      await this.fetcher.webOperation("DELETE", doc);
    } catch (error) {
      let message = "Error Deleting resource";
      if (error instanceof Error) message = error.message;
      throw new Error(message);
    }
  }

  private mapTitle(doc: NamedNode): string {
    return (
      this.store.any(doc, DCT("title"))?.value ??
      this.store.any(doc, RDFS("label"))?.value ?? ""
    );
  }
  private mapLink(doc: NamedNode): string {
    return this.store.any(doc, BOOKMARK("recalls"))?.value ?? "";
    // ??
    // this.store.any(doc, RDFS("label"))?.value
  }
  private mapCreated(doc: NamedNode): string | undefined {
    return (
      this.store.any(doc, DCT("created"))?.value ??
      this.store.any(doc, CRDT("createdAt"))?.value
    );
  }
  private mapUpdated(doc: NamedNode): string | undefined {
    return (
      this.store.any(doc, DCT("updated"))?.value ??
      this.store.any(doc, CRDT("updatedAt"))?.value
    );
  }
  private mapCreator(doc: NamedNode): string | undefined {
    return (
      this.store.any(doc, DCT("creator"))?.value ??
      this.store.any(doc, FOAF("maker"))?.value
    );
  }
  private mapTopic(doc: NamedNode): string | undefined {
    return this.store.any(doc, BOOKMARK("hasTopic"))?.value;
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
};
