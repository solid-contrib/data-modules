import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib.js";
import {
  expectPatchRequest,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";

describe("remove contact from group", () => {
  it("removes the contact reference from the group document", async () => {
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
      "https://pod.test/alice/contacts/Group/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Group;
        vcard:fn "Friends" ;
        vcard:hasMember <https://pod.test/alice/contacts/Person/1/index.ttl#this> .
        
    <https://pod.test/alice/contacts/Person/1/index.ttl#this> vcard:fn "Finley Kim" .
`,
    );

    await contacts.removeContactFromGroup({
      groupUri: "https://pod.test/alice/contacts/Group/1/index.ttl#this",
      contactUri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/1/index.ttl",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:deletes {
        <https://pod.test/alice/contacts/Group/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasMember> <https://pod.test/alice/contacts/Person/1/index.ttl#this> .
        <https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Finley Kim" .
      };   a solid:InsertDeletePatch .`,
    );
  });
});
