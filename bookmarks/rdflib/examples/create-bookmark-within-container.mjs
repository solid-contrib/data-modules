import BookmarksModule from '../dist/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const bookmarks = new BookmarksModule({store, fetcher, updater})

const uri = await bookmarks.createBookmark({
  storageUrl: "http://localhost:3000/alice/bookmarks/",
  title: "My favorite website",
  url: "https://favorite.example"
})

console.log("new bookmark: "  + uri)
