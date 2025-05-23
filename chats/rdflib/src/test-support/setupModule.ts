import { Fetcher, graph, UpdateManager } from "rdflib";
import { ChatsModuleRdfLib } from "../module/ChatsModuleRdfLib.js";

export function setupModule(authenticatedFetch: typeof fetch = fetch) {
  const store = graph();
  const fetcher = new Fetcher(store, {
    fetch: authenticatedFetch,
  });
  const updater = new UpdateManager(store);
  return new ChatsModuleRdfLib({ store, fetcher, updater });
}
