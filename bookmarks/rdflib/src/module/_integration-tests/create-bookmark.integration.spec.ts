import { BookmarksModuleRdfLib } from "../BookmarksModuleRdfLib";

import { generateId } from "../../generate-id";
import { expectPatchRequest } from "../../test-support/expectRequests";
import { Fetcher, graph, UpdateManager } from "rdflib";
import { mockNotFound } from "../../test-support/mockResponses";
import { when } from "jest-when";

jest.mock("../../generate-id");

describe("create bookmark", () => {
  it("creates a new document for the bookmark in the target container", async () => {
    const authenticatedFetch = jest.fn();

    when(generateId).mockReturnValue("70501305");

    jest.useFakeTimers().setSystemTime(new Date("2024-01-02T03:04:05.678Z"));

    const store = graph();
    const fetcher = new Fetcher(store, {
      fetch: authenticatedFetch,
    });
    const updater = new UpdateManager(store);
    const bookmarks = new BookmarksModuleRdfLib({
      store,
      fetcher,
      updater,
    });

    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks/70501305",
    );

    const createdUri = await bookmarks.createBookmark({
      containerUri: "https://pod.test/alice/bookmarks/",
      title: "My favorite website",
      url: "https://favorite.example",
    });

    expect(createdUri).toEqual("https://pod.test/alice/bookmarks/70501305#it");
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks/70501305",
      `INSERT DATA { <https://pod.test/alice/bookmarks/70501305#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/01/bookmark#Bookmark> .
<https://pod.test/alice/bookmarks/70501305#it> <http://purl.org/dc/terms/title> "My favorite website" .
<https://pod.test/alice/bookmarks/70501305#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://favorite.example> .
<https://pod.test/alice/bookmarks/70501305#it> <http://purl.org/dc/terms/created> "2024-01-02T03:04:05.678Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
 }`,
    );
  });
});
