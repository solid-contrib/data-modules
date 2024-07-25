import { Fetcher, IndexedFormula, NamedNode, UpdateManager } from "rdflib";

export * from "./web-operations/index.js";
export * from "./queries/index.js";
export * from "./module/index.js";
export * from "./update-operations/index.js";
export * from "./namespaces/index.js";

export interface ModuleConfig {
  store: IndexedFormula;
  fetcher: Fetcher;
  updater: UpdateManager;
}

export interface TypeRegistrations {
  instanceContainers: NamedNode[];
  instances: NamedNode[];
}

export interface TypeRegistrationsByVisibility {
  public: TypeRegistrations;
  private: TypeRegistrations;
}
