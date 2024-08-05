import {
  expectPatchRequest,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";
import { setupModule } from "../../test-support/setupModule";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("delete bookmark", () => {
  it("deletes the bookmark data from the document", async () => {
    const authenticatedFetch = jest.fn();

    const bookmarks = setupModule(authenticatedFetch);

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks/70501305",
      // language=turtle
      `
@prefix bookm: <http://www.w3.org/2002/01/bookmark#> .
@prefix dct:   <http://purl.org/dc/terms/> .

<https://pod.test/alice/bookmarks/70501305#it>
    a             bookm:Bookmark ;
    dct:title     "My favorite website" ;
    bookm:recalls <https://favorite.example> ;
    dct:created   "2024-01-02T03:04:05.678Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
.`,
    );

    await bookmarks.deleteBookmark(
      "https://pod.test/alice/bookmarks/70501305#it",
    );

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks/70501305",

      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:deletes {
        <https://pod.test/alice/bookmarks/70501305#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/01/bookmark#Bookmark> .
        <https://pod.test/alice/bookmarks/70501305#it> <http://purl.org/dc/terms/title> "My favorite website" .
        <https://pod.test/alice/bookmarks/70501305#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://favorite.example> .
        <https://pod.test/alice/bookmarks/70501305#it> <http://purl.org/dc/terms/created> "2024-01-02T03:04:05.678Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
      };   a solid:InsertDeletePatch .`,
    );
  });
});
