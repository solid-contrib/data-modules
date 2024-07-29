import { BookmarkQuery } from "./BookmarkQuery";
import { graph, lit, sym } from "rdflib";
import { bookm, dct } from "../namespaces";
import { rdf } from "@solid-data-modules/rdflib-utils";

describe(BookmarkQuery.name, () => {
  describe("queryBookmarks", () => {
    it("returns nothing if store is empty", () => {
      const store = graph();
      const result = new BookmarkQuery(
        sym("https://pod.test/bookmarks.ttl"),
        store,
      ).queryBookmarks();
      expect(result).toEqual([]);
    });

    it("returns a single bookmark", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/bookmarks.ttl#1"),
        rdf("type"),
        bookm("Bookmark"),
        sym("https://pod.test/bookmarks.ttl"),
      );
      store.add(
        sym("https://pod.test/bookmarks.ttl#1"),
        dct("title"),
        lit("Bookmark Title"),
        sym("https://pod.test/bookmarks.ttl"),
      );
      store.add(
        sym("https://pod.test/bookmarks.ttl#1"),
        bookm("recalls"),
        sym("https://bookmarked-url.test"),
        sym("https://pod.test/bookmarks.ttl"),
      );
      const result = new BookmarkQuery(
        sym("https://pod.test/bookmarks.ttl"),
        store,
      ).queryBookmarks();
      expect(result).toEqual([
        {
          uri: "https://pod.test/bookmarks.ttl#1",
          title: "Bookmark Title",
          bookmarkedUrl: "https://bookmarked-url.test",
        },
      ]);
    });
  });
});
