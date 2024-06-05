import { BookmarksModule, CreateBookmarkInContainerCommand } from "../index.js";
import { Fetcher, IndexedFormula, UpdateManager } from "rdflib";

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
    containerUri,
    title,
    url,
  }: CreateBookmarkInContainerCommand): Promise<string> {
    return containerUri + "abc123#it";
  }
}
