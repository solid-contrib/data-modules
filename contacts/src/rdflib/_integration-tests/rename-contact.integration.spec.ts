import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib.js";
import {
  expectPatchRequest,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";

describe("rename contact", () => {
  it("updates vcard:fn in the contacts document", async () => {
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
        vcard:fn "Finley Kim" .
`,
    );

    await contacts.renameContact({
      contactUri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
      newName: "Francisco Fernandez",
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:deletes {
        <https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Finley Kim" .
      };
      solid:inserts {
        <https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Francisco Fernandez" .
      };   a solid:InsertDeletePatch .`,
    );
  });

  it("also updates vcard:fn in the name-email index, if it is part of the store", async () => {
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
      "https://pod.test/alice/contacts/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix ab: <http://www.w3.org/ns/pim/ab#>.
    @prefix dc: <http://purl.org/dc/elements/1.1/>.
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
  
    <#this> a vcard:AddressBook;
        dc:title "Alice's contacts";
        vcard:nameEmailIndex <people.ttl>;
        vcard:groupIndex <groups.ttl>.
`,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/contacts/people.ttl",
      `@prefix vcard: <http://www.w3.org/2006/vcard/ns#>.

<https://pod.test/alice/contacts/Person/1/index.ttl#this>
    vcard:inAddressBook <https://pod.test/alice/contacts/index.ttl#this> ;
    vcard:fn            "Finley Kim" .

`,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/contacts/groups.ttl",
      "",
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.

    <#this> a vcard:Individual;
        vcard:fn "Finley Kim" .
`,
    );

    // read address book first, so that name-email index is part of the store
    const result = await contacts.readAddressBook(
      "https://pod.test/alice/contacts/index.ttl#this",
    );

    expect(result.contacts).toContainEqual({
      uri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
      name: "Finley Kim",
    });

    // then rename contact
    await contacts.renameContact({
      contactUri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
      newName: "Francisco Fernandez",
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/people.ttl",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:deletes {
        <https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Finley Kim" .
      };
      solid:inserts {
        <https://pod.test/alice/contacts/Person/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Francisco Fernandez" .
      };   a solid:InsertDeletePatch .`,
    );
  });
});
