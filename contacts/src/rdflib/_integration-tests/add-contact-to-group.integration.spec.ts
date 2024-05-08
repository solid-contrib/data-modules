import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib";
import { mockTurtleResponse } from "../../test-support/mockResponses";
import { expectPatchRequest } from "../../test-support/expectRequests";

describe("add contact to group", () => {
  it("references the contact to the group document", async () => {
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
      "https://pod.test/alice/contacts/Group/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Group;
        vcard:fn "Friends".
`,
    );

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Individual;
        vcard:fn "Finley Kim".
`,
    );

    await contacts.addContactToGroup({
      groupUri: "https://pod.test/alice/contacts/Group/1/index.ttl#this",
      contactUri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/1/index.ttl",
      `INSERT DATA { <https://pod.test/alice/contacts/Group/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasMember> <https://pod.test/alice/contacts/Person/1/index.ttl#this> .
<https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Finley Kim" .
 }`,
    );
  });
});
