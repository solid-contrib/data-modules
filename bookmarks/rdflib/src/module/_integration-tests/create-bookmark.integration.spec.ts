import { BookmarksModuleRdfLib } from "../BookmarksModuleRdfLib";

import { generateId } from "../../generate-id";
import { expectPatchRequest } from "../../test-support/expectRequests";
import { Fetcher, graph, UpdateManager } from "rdflib";

jest.mock("../../generate-id");

describe("create bookmark", () => {
  it("creates a new document for the bookmark in the target container", async () => {
    const authenticatedFetch = jest.fn();

    (generateId as jest.Mock).mockReturnValueOnce("70501305");

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

    const createdUri = await bookmarks.createBookmark({
      containerUri: "https://pod.test/alice/bookmarks/",
      title: "My favorite website",
      url: "http://favorite.example",
    });

    expect(createdUri).toEqual("https://pod.test/alice/bookmarks/70501305#it");
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/bookmarks/70501305",
      `INSERT DATA { <https://pod.test/alice/bookmarks/70501305#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/01/bookmark#Bookmark> .
<https://pod.test/alice/bookmarks/70501305#it> <http://purl.org/dc/terms/title> "My favorite website" .
<https://pod.test/alice/bookmarks/70501305#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://favorite.example> .
 }`,
    );
  });
});
