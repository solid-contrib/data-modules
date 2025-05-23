import BookmarksModule from "../dist/index.js";
import { Fetcher, graph, UpdateManager } from "rdflib";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);
const bookmarks = new BookmarksModule({ store, fetcher, updater });

const list = await bookmarks.listBookmarks("http://localhost:3000/alice/public/bookmarks");

if (list.length === 0) {
  throw new Error("no bookmarks left, try the create-bookmark-within-document example");
}

const bookmarkToDelete = list[0];

await bookmarks.deleteBookmark(bookmarkToDelete.uri);

console.log("bookmark deleted: ", bookmarkToDelete);
