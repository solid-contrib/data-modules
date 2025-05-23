import {
  expectPatchRequest,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";

import { setupModule } from "../../test-support/setupModule";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("update bookmark", () => {
  it("updates the bookmark values and modified timestamp", async () => {
    const authenticatedFetch = jest.fn();

    jest.useFakeTimers().setSystemTime(new Date("2024-05-06T07:08:09.123Z"));

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

    await bookmarks.updateBookmark({
      uri: "https://pod.test/alice/bookmarks/70501305#it",
      newTitle: "My updated website",
      newUrl: "https://update.example",
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks/70501305",

      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:deletes {
        <https://pod.test/alice/bookmarks/70501305#it> <http://purl.org/dc/terms/title> "My favorite website" .
        <https://pod.test/alice/bookmarks/70501305#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://favorite.example> .
      };
      solid:inserts {
        <https://pod.test/alice/bookmarks/70501305#it> <http://purl.org/dc/terms/modified> "2024-05-06T07:08:09.123Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        <https://pod.test/alice/bookmarks/70501305#it> <http://purl.org/dc/terms/title> "My updated website" .
        <https://pod.test/alice/bookmarks/70501305#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://update.example> .
      };   a solid:InsertDeletePatch .`,
    );
  });
});
