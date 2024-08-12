import { ChatsModule, CreateChatCommand } from "../index.js";
import { Fetcher, IndexedFormula, UpdateManager } from "rdflib";

import { executeUpdate, ModuleSupport } from "@solid-data-modules/rdflib-utils";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import { createChat } from "./update-operations/index.js";

interface ModuleConfig {
  store: IndexedFormula;
  fetcher: Fetcher;
  updater: UpdateManager;
}

export class ChatsModuleRdfLib implements ChatsModule {
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

  async createChat({ containerUri, name }: CreateChatCommand): Promise<string> {
    const id = generateId();
    const mintedUri = `${containerUri}${id}/index.ttl#this`;
    const operation = createChat(mintedUri, name);
    await executeUpdate(this.fetcher, this.updater, operation);
    return mintedUri;
  }
}
