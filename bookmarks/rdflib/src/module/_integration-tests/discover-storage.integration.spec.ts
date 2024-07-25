import { BookmarksModuleRdfLib } from "../BookmarksModuleRdfLib";

import { mockTurtleDocument } from "@solid-data-modules/rdflib-utils/test-support";
import { Fetcher, graph, UpdateManager } from "rdflib";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("discover storage", () => {
  it("discovers all documents and containers", async () => {
    const authenticatedFetch = jest.fn();

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

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/profile/card",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
    @prefix pim: <http://www.w3.org/ns/pim/space#>.
  
    <#me> a vcard:Individual;
        vcard:fn "Alice";
        solid:publicTypeIndex <https://pod.test/alice/settings/publicTypeIndex.ttl> ;
        pim:preferencesFile <https://pod.test/alice/settings/prefs.ttl> ;
        .
`,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/settings/publicTypeIndex.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
    @prefix bookm: <http://www.w3.org/2002/01/bookmark#> .
  
    <#registration-1> a solid:TypeRegistration ;
       solid:forClass bookm:Bookmark ;
       solid:instance <https://pod.test/alice/public/bookmarks.ttl>, <https://pod.test/alice/public/more-bookmarks> ;
       .
       
     <#registration-2> a solid:TypeRegistration ;
       solid:forClass bookm:Bookmark ;
       solid:instanceContainer <https://pod.test/alice/public/recommended-readings/> ;
       .
`,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/settings/prefs.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
  
    <https://pod.test/alice/profile/card#me> 
        solid:privateTypeIndex <https://pod.test/alice/settings/privateTypeIndex.ttl> ;
        .
`,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/settings/privateTypeIndex.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
    @prefix bookm: <http://www.w3.org/2002/01/bookmark#> .
  
    <#registration-1> a solid:TypeRegistration ;
       solid:forClass bookm:Bookmark ;
       solid:instance <https://pod.test/alice/private/bookmarks.ttl>, <https://pod.test/alice/private/more-bookmarks> ;
       .
       
     <#registration-2> a solid:TypeRegistration ;
       solid:forClass bookm:Bookmark ;
       solid:instanceContainer <https://pod.test/private/read-it-later/> ;
       .
`,
    );

    const result = await bookmarks.discoverStorage(
      "https://pod.test/alice/profile/card#me",
    );

    expect(result).toEqual({
      private: {
        containerUrls: ["https://pod.test/private/read-it-later/"],
        documentUrls: [
          "https://pod.test/alice/private/bookmarks.ttl",
          "https://pod.test/alice/private/more-bookmarks",
        ],
      },
      public: {
        containerUrls: ["https://pod.test/alice/public/recommended-readings/"],
        documentUrls: [
          "https://pod.test/alice/public/bookmarks.ttl",
          "https://pod.test/alice/public/more-bookmarks",
        ],
      },
    });
  });
});
