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

/**
 * Lists instances and containers found in a type index
 */
export interface TypeRegistrations {
  instanceContainers: NamedNode[];
  instances: NamedNode[];
}

/**
 * Type registrations grouped by whether they have been discovered in private or public type index.
 */
export interface TypeRegistrationsByVisibility {
  public: TypeRegistrations;
  private: TypeRegistrations;
}
