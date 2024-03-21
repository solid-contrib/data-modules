import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModule } from "../rdflib/index.js";

export function setupModule() {
  const store = graph();
  const fetcher = new Fetcher(store);
  const updater = new UpdateManager(store);
  return new ContactsModule({ store, fetcher, updater });
}
