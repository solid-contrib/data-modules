import { BookmarkQuery } from "./BookmarkQuery";
import { graph, parse, sym } from "rdflib";

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
      parse(
        `
      @prefix bookm: <http://www.w3.org/2002/01/bookmark#> .
      @prefix dct:   <http://purl.org/dc/terms/> .
      
      <#1> a             bookm:Bookmark ;
           dct:title     "Bookmark Title" ;
           bookm:recalls <https://bookmarked-url.test> .
      `,
        store,
        "https://pod.test/bookmarks.ttl",
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

      parse(
        `
        @prefix bookm: <http://www.w3.org/2002/01/bookmark#> .
        @prefix dct:   <http://purl.org/dc/terms/> .
        
        <#1> a             bookm:Bookmark ;
             dct:title     "Bookmark 1" ;
             bookm:recalls <https://bookmarked-url-1.test> .
        
        <#2> a             bookm:Bookmark ;
             dct:title     "Bookmark 2" ;
             bookm:recalls <https://bookmarked-url-2.test> .
      `,
        store,
        "https://pod.test/bookmarks.ttl",
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
