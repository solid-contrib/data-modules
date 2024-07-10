import { BookmarksModule, CreateBookmarkCommand } from "../index.js";
import { Fetcher, IndexedFormula, sym, UpdateManager } from "rdflib";
import {
  createBookmarkWithinContainer,
  createBookmarkWithinDocument,
} from "./update-operations/index.js";
import { executeUpdate, ldp, rdf } from "@solid-data-modules/rdflib-utils";

interface ModuleConfig {
  store: IndexedFormula;
  fetcher: Fetcher;
  updater: UpdateManager;
}

export class BookmarksModuleRdfLib implements BookmarksModule {
  private readonly fetcher: Fetcher;
  private readonly store: IndexedFormula;
  private readonly updater: UpdateManager;

  constructor(config: ModuleConfig) {
    this.store = config.store;
    this.fetcher = config.fetcher;
    this.updater = config.updater;
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
