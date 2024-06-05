import { BookmarksModule, CreateBookmarkInContainerCommand } from "../index.js";
import { Fetcher, IndexedFormula, UpdateManager } from "rdflib";
import { createBookmarkWithinContainer } from "./update-operations/index.js";
import { executeUpdate } from "./web-operations/executeUpdate.js";

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
    const operation = createBookmarkWithinContainer(containerUri, title, url);
    await executeUpdate(this.fetcher, this.updater, operation);
    return operation.uri;
  }
}
