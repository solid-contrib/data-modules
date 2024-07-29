import {
  Bookmark,
  BookmarksModule,
  BookmarkStorage,
  CreateBookmarkCommand,
} from "../index.js";
import { Fetcher, IndexedFormula, NamedNode, sym, UpdateManager } from "rdflib";
import {
  createBookmarkWithinContainer,
  createBookmarkWithinDocument,
} from "./update-operations/index.js";
import {
  ContainerQuery,
  executeUpdate,
  ldp,
  ModuleSupport,
  rdf,
} from "@solid-data-modules/rdflib-utils";
import { bookm } from "./namespaces.js";
import { BookmarkQuery } from "./queries/index.js";

const BOOKM_BOOKMARK = bookm("Bookmark") as NamedNode;

interface ModuleConfig {
  store: IndexedFormula;
  fetcher: Fetcher;
  updater: UpdateManager;
}

export class BookmarksModuleRdfLib implements BookmarksModule {
  private readonly fetcher: Fetcher;
  private readonly store: IndexedFormula;
  private readonly updater: UpdateManager;
  private readonly support: ModuleSupport;

  constructor(config: ModuleConfig) {
    this.store = config.store;
    this.fetcher = config.fetcher;
    this.updater = config.updater;
    this.support = new ModuleSupport(config);
  }

  async listBookmarks(storageUrl: string): Promise<Bookmark[]> {
    if (await this.support.isContainer(storageUrl)) {
      const containerNode = sym(storageUrl);
      const contents = new ContainerQuery(
        containerNode,
        this.store,
      ).queryContents();
      await this.support.fetchAll(contents);
      return contents.flatMap((document) =>
        new BookmarkQuery(document, this.store).queryBookmarks(),
      );
    } else {
      const bookmarkDoc = sym(storageUrl);
      return new BookmarkQuery(bookmarkDoc, this.store).queryBookmarks();
    }
  }

  async discoverStorage(webId: string): Promise<BookmarkStorage> {
    const registrations = await this.support.discoverType(
      sym(webId),
      BOOKM_BOOKMARK,
    );
    return {
      privateUrls: urisOf([
        ...registrations.private.instances,
        ...registrations.private.instanceContainers,
      ]),
      publicUrls: urisOf([
        ...registrations.public.instances,
        ...registrations.public.instanceContainers,
      ]),
    };
  }

  async createBookmark({
    storageUrl,
    title,
    url,
  }: CreateBookmarkCommand): Promise<string> {
    const storageNode = sym(storageUrl);
    await this.fetcher.load(storageNode.value);
    const isContainer = this.store.holds(
      storageNode,
      rdf("type"),
      ldp("Container"),
      storageNode.doc(),
    );

    const operation = (
      isContainer ? createBookmarkWithinContainer : createBookmarkWithinDocument
    )(storageUrl, title, url);

    await executeUpdate(this.fetcher, this.updater, operation);
    return operation.uri;
  }
}

function urisOf(nodes: NamedNode[]) {
  return nodes.map((it) => it.uri);
}
