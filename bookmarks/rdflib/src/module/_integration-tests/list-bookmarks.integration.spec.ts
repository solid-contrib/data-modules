import {
  mockLdpContainer,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";
import { setupModule } from "../../test-support/setupModule";

describe("list bookmarks", () => {
  it("returns all bookmarks from a document", async () => {
    const authenticatedFetch = jest.fn();

    const bookmarks = setupModule(authenticatedFetch);

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks.ttl",
      `
          @prefix :      <#>.
          @prefix terms: <http://purl.org/dc/terms/>.
          @prefix bookm: <http://www.w3.org/2002/01/bookmark#>.
          @prefix xsd:   <http://www.w3.org/2001/XMLSchema#>.

          <#1>
              a             bookm:Bookmark ;
              terms:title   "Bookmark One" ;
              bookm:recalls <https://one.test> .
              
          <#2>
              a             bookm:Bookmark ;
              terms:title   "Bookmark Two" ;
              bookm:recalls <https://two.test> . 
    `,
    );

    const result = await bookmarks.listBookmarks(
      "https://pod.test/alice/bookmarks.ttl",
    );

    expect(result).toContainEqual({
      uri: "https://pod.test/alice/bookmarks.ttl#1",
      title: "Bookmark One",
      bookmarkedUrl: "https://one.test",
    });
    expect(result).toContainEqual({
      uri: "https://pod.test/alice/bookmarks.ttl#2",
      title: "Bookmark Two",
      bookmarkedUrl: "https://two.test",
    });
    expect(result).toHaveLength(2);
  });

  it("returns all bookmarks from a container", async () => {
    const authenticatedFetch = jest.fn();

    const bookmarks = setupModule(authenticatedFetch);

    mockLdpContainer(authenticatedFetch, "https://pod.test/alice/bookmarks/", [
      "https://pod.test/alice/bookmarks/first",
      "https://pod.test/alice/bookmarks/second",
    ]);

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks/first",
      `
          @prefix :      <#>.
          @prefix terms: <http://purl.org/dc/terms/>.
          @prefix bookm: <http://www.w3.org/2002/01/bookmark#>.
          @prefix xsd:   <http://www.w3.org/2001/XMLSchema#>.

          <#it>
              a             bookm:Bookmark ;
              terms:title   "Bookmark One" ;
              bookm:recalls <https://one.test> .
    `,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks/second",
      `
          @prefix :      <#>.
          @prefix terms: <http://purl.org/dc/terms/>.
          @prefix bookm: <http://www.w3.org/2002/01/bookmark#>.
          @prefix xsd:   <http://www.w3.org/2001/XMLSchema#>.

          <#it>
              a             bookm:Bookmark ;
              terms:title   "Bookmark Two" ;
              bookm:recalls <https://two.test> .
    `,
    );

    const result = await bookmarks.listBookmarks(
      "https://pod.test/alice/bookmarks/",
    );

    expect(result).toContainEqual({
      uri: "https://pod.test/alice/bookmarks/first#it",
      title: "Bookmark One",
      bookmarkedUrl: "https://one.test",
    });
    expect(result).toContainEqual({
      uri: "https://pod.test/alice/bookmarks/second#it",
      title: "Bookmark Two",
      bookmarkedUrl: "https://two.test",
    });
    expect(result).toHaveLength(2);
  });
});
