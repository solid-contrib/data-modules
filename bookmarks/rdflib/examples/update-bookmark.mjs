import BookmarksModule from "../dist/index.js";
import { Fetcher, graph, UpdateManager } from "rdflib";
import { faker } from "@faker-js/faker";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);
const bookmarks = new BookmarksModule({ store, fetcher, updater });

const newTitle = faker.commerce.productName();
const newUrl = faker.internet.url();

const uri = "http://localhost:3000/alice/bookmarks/d041c8c8-75af-48ee-8d8e-a1d9b6624d01#it";

await bookmarks.updateBookmark({
  uri,
  newTitle,
  newUrl
});

console.log("updated bookmark: " + uri, { newTitle, newUrl });
