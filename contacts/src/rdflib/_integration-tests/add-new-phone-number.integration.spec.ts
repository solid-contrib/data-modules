import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib.js";
import { when } from "jest-when";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import {
  expectPatchRequest,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("add new phone number", () => {
  it("adds a new phone number resource to the contact document", async () => {
    when(generateId).mockReturnValue("7ab73096");

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
        vcard:fn "Finley Kim".
`,
    );

    const uri = await contacts.addNewPhoneNumber({
      contactUri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
      newPhoneNumber: "123456789",
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasTelephone> <https://pod.test/alice/contacts/Person/1/index.ttl#7ab73096> .
        <https://pod.test/alice/contacts/Person/1/index.ttl#7ab73096> <http://www.w3.org/2006/vcard/ns#value> <tel:123456789> .
      };   a solid:InsertDeletePatch .`,
    );

    expect(uri).toEqual(
      "https://pod.test/alice/contacts/Person/1/index.ttl#7ab73096",
    );
  });
});
