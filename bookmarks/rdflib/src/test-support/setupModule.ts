import { Fetcher, graph, UpdateManager } from "rdflib";
import { BookmarksModuleRdfLib } from "../module/BookmarksModuleRdfLib.js";

export function setupModule(authenticatedFetch: typeof fetch = fetch) {
  const store = graph();
  const fetcher = new Fetcher(store, {
    fetch: authenticatedFetch,
  });
  const updater = new UpdateManager(store);
  return new BookmarksModuleRdfLib({ store, fetcher, updater });
}
