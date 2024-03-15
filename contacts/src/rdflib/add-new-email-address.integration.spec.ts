import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import { mockTurtleResponse } from "../test-support/mockResponses";
import { expectPatchRequest } from "../test-support/expectRequests";
import { generateId } from "./generate-id";
import { when } from "jest-when";

jest.mock("./generate-id");

describe("add new email address", () => {
  it("adds a new email address resource to the contact document", async () => {
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

    const uri = await contacts.addNewEmailAddress(
      "https://pod.test/alice/contacts/Person/1/index.ttl#this",
      "alice@mail.test",
    );

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `INSERT DATA { <https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasEmail> <https://pod.test/alice/contacts/Person/1/index.ttl#7ab73096> .
<https://pod.test/alice/contacts/Person/1/index.ttl#7ab73096> <http://www.w3.org/2006/vcard/ns#value> <mailto:alice@mail.test> .
 }`,
    );

    expect(uri).toEqual(
      "https://pod.test/alice/contacts/Person/1/index.ttl#7ab73096",
    );
  });
});
