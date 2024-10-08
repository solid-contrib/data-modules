import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib.js";
import {
  expectPatchRequest,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";

describe("remove email address", () => {
  it("removes the email address statements and link to contact", async () => {
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
        vcard:hasEmail <https://pod.test/alice/contacts/Person/1/email#this>.
`,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/email",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this>
        vcard:value <mailto:bob@mail.test> .
`,
    );

    await contacts.removeEmailAddress({
      contactUri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
      emailAddressUri: "https://pod.test/alice/contacts/Person/1/email#this",
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:deletes {
        <https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasEmail> <https://pod.test/alice/contacts/Person/1/email#this> .
      };   a solid:InsertDeletePatch .`,
    );

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/email",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:deletes {
        <https://pod.test/alice/contacts/Person/1/email#this> <http://www.w3.org/2006/vcard/ns#value> <mailto:bob@mail.test> .
      };   a solid:InsertDeletePatch .`,
    );
  });
});
