import { ChatsModule, CreateChatCommand } from "../index.js";
import { Fetcher, IndexedFormula, UpdateManager } from "rdflib";

import { ModuleSupport } from "@solid-data-modules/rdflib-utils";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";


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

  createChat({ containerUri, name }: CreateChatCommand): string {
    const id = generateId();
    return `${containerUri}${id}/index.ttl#this`;
  }

}
