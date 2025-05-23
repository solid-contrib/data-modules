import { mockTurtleDocument } from "@solid-data-modules/rdflib-utils/test-support";
import { setupModule } from "../../test-support/setupModule";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("discover storage", () => {
  it("discovers all documents and containers", async () => {
    const authenticatedFetch = jest.fn();

    const bookmarks = setupModule(authenticatedFetch);

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
      privateUrls: [
        "https://pod.test/alice/private/bookmarks.ttl",
        "https://pod.test/alice/private/more-bookmarks",
        "https://pod.test/private/read-it-later/",
      ],
      publicUrls: [
        "https://pod.test/alice/public/bookmarks.ttl",
        "https://pod.test/alice/public/more-bookmarks",
        "https://pod.test/alice/public/recommended-readings/",
      ],
    });
  });
});
