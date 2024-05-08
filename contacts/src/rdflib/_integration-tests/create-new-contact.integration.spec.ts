import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib";
import {
  mockNotFound,
  mockTurtleResponse,
} from "../../test-support/mockResponses";

import { generateId } from "../generate-id";
import { expectPatchRequest } from "../../test-support/expectRequests";
import { Fetcher, graph, UpdateManager } from "rdflib";

jest.mock("../generate-id");

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

    mockTurtleResponse(
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

    mockTurtleResponse(
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
      `INSERT DATA { <https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Bob" .
<https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#Individual> .
 }`,
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

    mockTurtleResponse(
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

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Group;
        vcard:fn "Group 1".
`,
    );

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/2/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Group;
        vcard:fn "Group 2".
`,
    );

    mockTurtleResponse(
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
      `INSERT DATA { <https://pod.test/alice/contacts/Group/1/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasMember> <https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> .
<https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Bob" .
 }`,
    );

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/2/index.ttl",
      `INSERT DATA { <https://pod.test/alice/contacts/Group/2/index.ttl#this> <http://www.w3.org/2006/vcard/ns#hasMember> <https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> .
<https://pod.test/alice/contacts/Person/82dfdfc0/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Bob" .
 }`,
    );
  });
});
