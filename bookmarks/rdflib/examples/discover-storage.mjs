import BookmarksModule from "../dist/index.js";
import { Fetcher, graph, UpdateManager } from "rdflib";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);
const bookmarks = new BookmarksModule({ store, fetcher, updater });

const result = await bookmarks.discoverStorage("http://localhost:3000/alice/profile/card#me");

console.log("bookmark storages: ", result);
