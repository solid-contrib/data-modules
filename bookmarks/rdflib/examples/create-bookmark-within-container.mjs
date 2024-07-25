import BookmarksModule from "../dist/index.js";
import { Fetcher, graph, UpdateManager } from "rdflib";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);
const bookmarks = new BookmarksModule({ store, fetcher, updater });

const storages = await bookmarks.discoverStorage("http://localhost:3000/alice/profile/card#me");
const privateContainerUrl = storages.private.containerUrls[0];
if (!privateContainerUrl) {
  throw new Error("there is no private container for bookmarks");
}

const uri = await bookmarks.createBookmark({
  storageUrl: privateContainerUrl,
  title: "My favorite website",
  url: "https://favorite.example"
});

console.log("new bookmark: " + uri);
