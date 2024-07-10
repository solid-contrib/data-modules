import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib.js";

import { Fetcher, graph, UpdateManager } from "rdflib";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import {
  expectPatchRequest,
  mockNotFound,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("create new contact", () => {
  it("creates contact resource", async () => {
    const authenticatedFetch = jest.fn();

    (generateId as jest.Mock).mockReturnValueOnce("82dfdfc0");

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
      "",
    );

    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl",
    );

    const createdUri = await contacts.createNewContact({
      addressBookUri: "https://pod.test/alice/contacts/index.ttl#this",
      contact: {
        name: "Bob",
      },
    });

    expect(createdUri).toEqual(
      "https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this",
    );
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Bob" .
        <https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#Individual> .
      };   a solid:InsertDeletePatch .`,
    );
  });

  it("adds new contact to existing group", async () => {
    const authenticatedFetch = jest.fn();

    (generateId as jest.Mock).mockReturnValueOnce("82dfdfc0");

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
      "https://pod.test/alice/contacts/Group/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Group;
        vcard:fn "Group 1".
`,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/2/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Group;
        vcard:fn "Group 2".
`,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/contacts/people.ttl",
      "",
    );

    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl",
    );

    await contacts.createNewContact({
      addressBookUri: "https://pod.test/alice/contacts/index.ttl#this",
      contact: {
        name: "Bob",
      },
      groupUris: [
        "https://pod.test/alice/contacts/Group/1/index.ttl#this",
        "https://pod.test/alice/contacts/Group/2/index.ttl#this",
      ],
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/1/index.ttl",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/alice/contacts/Group/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasMember> <https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> .
        <https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Bob" .
      };   a solid:InsertDeletePatch .`,
    );

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/2/index.ttl",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/alice/contacts/Group/2/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasMember> <https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> .
        <https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Bob" .
      };   a solid:InsertDeletePatch .`,
    );
  });
});
