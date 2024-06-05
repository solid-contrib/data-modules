import { Fetcher, graph, UpdateManager } from "rdflib";
import { BookmarksModuleRdfLib } from "../module/BookmarksModuleRdfLib";

export function setupModule(authenticatedFetch: typeof fetch = fetch) {
  const store = graph();
  const fetcher = new Fetcher(store, {
    fetch: authenticatedFetch,
  });
  const updater = new UpdateManager(store);
  return new BookmarksModuleRdfLib({ store, fetcher, updater });
}
