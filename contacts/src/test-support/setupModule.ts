import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModule } from "../rdflib/index.js";

export function setupModule(authenticatedFetch: typeof fetch = fetch) {
  const store = graph();
  const fetcher = new Fetcher(store, {
    fetch: authenticatedFetch,
  });
  const updater = new UpdateManager(store);
  return new ContactsModule({ store, fetcher, updater });
}
