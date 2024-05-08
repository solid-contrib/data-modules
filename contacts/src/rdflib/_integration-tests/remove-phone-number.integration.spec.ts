import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib";
import { mockTurtleResponse } from "../../test-support/mockResponses";
import { expectPatchRequest } from "../../test-support/expectRequests";

jest.mock("../generate-id");

describe("remove phone number", () => {
  it("removes the phone number statements and link to contact", async () => {
    const authenticatedFetch = jest.fn();

    const store = graph();
    const fetcher = new Fetcher(store, {
      fetch: authenticatedFetch,
    });
    const updater = new UpdateManager(store);
    const contacts = new ContactsModuleRdfLib({
      store,
      fetcher,
      updater,
    });

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.

    <#this> a vcard:Individual;
        vcard:fn "Finley Kim"; 
        vcard:hasTelephone <https://pod.test/alice/contacts/Person/1/phone#this>.
`,
    );

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/phone",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this>
        vcard:value <tel:+123456> .
`,
    );

    await contacts.removePhoneNumber({
      contactUri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
      phoneNumberUri: "https://pod.test/alice/contacts/Person/1/phone#this",
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `DELETE DATA { <https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasTelephone> <https://pod.test/alice/contacts/Person/1/phone#this> .
 }`,
    );

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/phone",
      `DELETE DATA { <https://pod.test/alice/contacts/Person/1/phone#this> <http://www.w3.org/2006/vcard/ns#value> <tel:+123456> .
 }`,
    );
  });
});
