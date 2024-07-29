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

    it("returns multiple bookmarks", () => {
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
        lit("Bookmark 1"),
        sym("https://pod.test/bookmarks.ttl"),
      );
      store.add(
        sym("https://pod.test/bookmarks.ttl#1"),
        bookm("recalls"),
        sym("https://bookmarked-url-1.test"),
        sym("https://pod.test/bookmarks.ttl"),
      );
      store.add(
        sym("https://pod.test/bookmarks.ttl#2"),
        rdf("type"),
        bookm("Bookmark"),
        sym("https://pod.test/bookmarks.ttl"),
      );
      store.add(
        sym("https://pod.test/bookmarks.ttl#2"),
        dct("title"),
        lit("Bookmark 2"),
        sym("https://pod.test/bookmarks.ttl"),
      );
      store.add(
        sym("https://pod.test/bookmarks.ttl#2"),
        bookm("recalls"),
        sym("https://bookmarked-url-2.test"),
        sym("https://pod.test/bookmarks.ttl"),
      );
      const result = new BookmarkQuery(
        sym("https://pod.test/bookmarks.ttl"),
        store,
      ).queryBookmarks();
      expect(result).toEqual([
        {
          uri: "https://pod.test/bookmarks.ttl#1",
          title: "Bookmark 1",
          bookmarkedUrl: "https://bookmarked-url-1.test",
        },
        {
          uri: "https://pod.test/bookmarks.ttl#2",
          title: "Bookmark 2",
          bookmarkedUrl: "https://bookmarked-url-2.test",
        },
      ]);
    });
  });
});
