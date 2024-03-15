import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import { mockTurtleResponse } from "../test-support/mockResponses";
import { expectPatchRequest } from "../test-support/expectRequests";
import { generateId } from "./generate-id";
import { when } from "jest-when";

jest.mock("./generate-id");

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

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Individual;
        vcard:fn "Finley Kim".
`,
    );

    const uri = await contacts.addNewPhoneNumber(
      "https://pod.test/alice/contacts/Person/1/index.ttl#this",
      "123456789",
    );

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `INSERT DATA { <https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasTelephone> <https://pod.test/alice/contacts/Person/1/index.ttl#7ab73096> .
<https://pod.test/alice/contacts/Person/1/index.ttl#7ab73096> <http://www.w3.org/2006/vcard/ns#value> <tel:123456789> .
 }`,
    );

    expect(uri).toEqual(
      "https://pod.test/alice/contacts/Person/1/index.ttl#7ab73096",
    );
  });
});
