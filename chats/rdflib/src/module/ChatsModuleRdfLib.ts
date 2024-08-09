import {ChatsModule,} from "../index.js";
import {Fetcher, IndexedFormula, UpdateManager} from "rdflib";

import {ModuleSupport,} from "@solid-data-modules/rdflib-utils";


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

}
