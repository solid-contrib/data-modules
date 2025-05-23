import {
  expectPatchRequest,
  mockLdpContainer,
  mockNotFound,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";

import { when } from "jest-when";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import { setupModule } from "../../test-support/setupModule";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("create bookmark", () => {
  it("creates a new document for the bookmark in the target container", async () => {
    const authenticatedFetch = jest.fn();

    when(generateId).mockReturnValue("70501305");

    jest.useFakeTimers().setSystemTime(new Date("2024-01-02T03:04:05.678Z"));

    const bookmarks = setupModule(authenticatedFetch);

    mockLdpContainer(authenticatedFetch, "https://pod.test/alice/bookmarks/");

    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks/70501305",
    );

    const createdUri = await bookmarks.createBookmark({
      storageUrl: "https://pod.test/alice/bookmarks/",
      title: "My favorite website",
      url: "https://favorite.example",
    });

    expect(createdUri).toEqual("https://pod.test/alice/bookmarks/70501305#it");
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks/70501305",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/alice/bookmarks/70501305#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/01/bookmark#Bookmark> .
        <https://pod.test/alice/bookmarks/70501305#it> <http://purl.org/dc/terms/title> "My favorite website" .
        <https://pod.test/alice/bookmarks/70501305#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://favorite.example> .
        <https://pod.test/alice/bookmarks/70501305#it> <http://purl.org/dc/terms/created> "2024-01-02T03:04:05.678Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
      };   a solid:InsertDeletePatch .`,
    );
  });

  it("adds a new bookmark to an existing document", async () => {
    const authenticatedFetch = jest.fn();

    when(generateId).mockReturnValue("f7a4eeb7");

    jest.useFakeTimers().setSystemTime(new Date("2024-01-02T03:04:05.678Z"));

    const bookmarks = setupModule(authenticatedFetch);

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks",
      ``,
    );

    const createdUri = await bookmarks.createBookmark({
      storageUrl: "https://pod.test/alice/bookmarks",
      title: "My favorite website",
      url: "https://favorite.example",
    });

    expect(createdUri).toEqual("https://pod.test/alice/bookmarks#f7a4eeb7");
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/alice/bookmarks#f7a4eeb7> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/01/bookmark#Bookmark> .
        <https://pod.test/alice/bookmarks#f7a4eeb7> <http://purl.org/dc/terms/title> "My favorite website" .
        <https://pod.test/alice/bookmarks#f7a4eeb7> <http://www.w3.org/2002/01/bookmark#recalls> <https://favorite.example> .
        <https://pod.test/alice/bookmarks#f7a4eeb7> <http://purl.org/dc/terms/created> "2024-01-02T03:04:05.678Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
      };   a solid:InsertDeletePatch .`,
    );
  });
});
