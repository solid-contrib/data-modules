import BookmarksModule from "../dist/index.js";
import { Fetcher, graph, UpdateManager } from "rdflib";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);
const bookmarks = new BookmarksModule({ store, fetcher, updater });

const result = await bookmarks.listBookmarks("http://localhost:3000/alice/bookmarks/");

console.log("bookmarks: ", result);
