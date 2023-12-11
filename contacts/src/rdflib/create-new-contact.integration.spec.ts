import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import {
  mockNotFound,
  mockTurtleResponse,
} from "../test-support/mockResponses";

import { v4 as uuid } from "uuid";
import { expectPatchRequest } from "../test-support/expectRequests";
import { Fetcher, graph, UpdateManager } from "rdflib";

jest.mock("uuid");

describe("create new contact", () => {
  it("creates contact resource", async () => {
    const authenticatedFetch = jest.fn();

    (uuid as jest.Mock).mockReturnValueOnce(
      "82dfdfc0-d13c-4dfc-b36d-c0d11db81d94",
    );

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
      "https://pod.test/alice/contacts/Person/82dfdfc0-d13c-4dfc-b36d-c0d11db81d94/index.ttl",
    );

    const createdUri = await contacts.createNewContact({
      addressBook: "https://pod.test/alice/contacts/index.ttl#this",
      contact: {
        name: "Bob",
      },
    });

    expect(createdUri).toEqual(
      "https://pod.test/alice/contacts/Person/82dfdfc0-d13c-4dfc-b36d-c0d11db81d94/index.ttl#this",
    );
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/82dfdfc0-d13c-4dfc-b36d-c0d11db81d94/index.ttl",
      `INSERT DATA { <https://pod.test/alice/contacts/Person/82dfdfc0-d13c-4dfc-b36d-c0d11db81d94/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "Bob" .
<https://pod.test/alice/contacts/Person/82dfdfc0-d13c-4dfc-b36d-c0d11db81d94/index.ttl#this> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#Individual> .
 }`,
    );
  });
});
