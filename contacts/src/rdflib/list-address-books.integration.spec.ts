import { mockTurtleResponse } from "../test-support/mockResponses";
import { setupModule } from "../test-support/setupModule";

describe("list address books", () => {
  it("lists all instances from public type index", async () => {
    const authenticatedFetch = jest.fn();

    const contacts = setupModule(authenticatedFetch);

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/profile/card",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
  
    <#me> a vcard:Individual;
        vcard:fn "Alice";
        solid:publicTypeIndex <https://pod.test/alice/settings/publicTypeIndex.ttl> ;
        .
`,
    );

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/settings/publicTypeIndex.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
  
    <#registration> a solid:TypeRegistration ;
       solid:forClass vcard:AddressBook ;
       solid:instance <https://pod.test/alice/contacts/1/index.ttl#this>, <https://pod.test/alice/contacts/2/index.ttl#this> ;
       .
`,
    );

    const result = await contacts.listAddressBooks(
      "https://pod.test/alice/profile/card#me",
    );

    expect(result).toMatchObject({
      publicUris: [
        "https://pod.test/alice/contacts/1/index.ttl#this",
        "https://pod.test/alice/contacts/2/index.ttl#this",
      ],
      privateUris: [],
    });
  });
});
