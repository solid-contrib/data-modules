import { Fetcher, IndexedFormula, UpdateManager } from "rdflib";

export * from "./web-operations/index.js";
export * from "./identifier/index.js";

export interface ModuleConfig {
  store: IndexedFormula;
  fetcher: Fetcher;
  updater: UpdateManager;
}
