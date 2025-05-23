import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib.js";
import {
  expectPatchRequest,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";

describe("update phone number", () => {
  it("updates the phone number value statement", async () => {
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

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.

    <#this> a vcard:Individual;
        vcard:fn "Finley Kim"; 
        vcard:hasTelephone <https://pod.test/alice/contacts/Person/1/phone#this>.
`,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/phone",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this>
        vcard:value <tel:+123456> .
`,
    );

    await contacts.updatePhoneNumber({
      phoneNumberUri: "https://pod.test/alice/contacts/Person/1/phone#this",
      newPhoneNumber: "+654321",
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/phone",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:deletes {
        <https://pod.test/alice/contacts/Person/1/phone#this> <http://www.w3.org/2006/vcard/ns#value> <tel:+123456> .
      };
      solid:inserts {
        <https://pod.test/alice/contacts/Person/1/phone#this> <http://www.w3.org/2006/vcard/ns#value> <tel:+654321> .
      };   a solid:InsertDeletePatch .`,
    );
  });
});
