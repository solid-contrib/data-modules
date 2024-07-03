import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib.js";
import { mockTurtleResponse } from "../../test-support/mockResponses.js";
import { expectPatchRequest } from "../../test-support/expectRequests.js";
import { when } from "jest-when";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

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

    const uri = await contacts.addNewEmailAddress({
      contactUri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
      newEmailAddress: "alice@mail.test",
    });

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
