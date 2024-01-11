import { v4 as uuid } from "uuid";
import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import {
  mockNotFound,
  mockTurtleResponse,
} from "../test-support/mockResponses";
import { expectPatchRequest } from "../test-support/expectRequests";

jest.mock("uuid");

describe("create new group", () => {
  it("creates group resource", async () => {
    const authenticatedFetch = jest.fn();

    (uuid as jest.Mock).mockReturnValueOnce(
      "b4e9fd85-3b38-4db7-8599-d0eda0b2ac74",
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
      "https://pod.test/alice/contacts/groups.ttl",
      "",
    );

    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/b4e9fd85-3b38-4db7-8599-d0eda0b2ac74/index.ttl",
    );

    const createdUri = await contacts.createNewGroup({
      addressBookUri: "https://pod.test/alice/contacts/index.ttl#this",
      groupName: "best friends",
    });

    expect(createdUri).toEqual(
      "https://pod.test/alice/contacts/Group/b4e9fd85-3b38-4db7-8599-d0eda0b2ac74/index.ttl#this",
    );
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/b4e9fd85-3b38-4db7-8599-d0eda0b2ac74/index.ttl",
      `INSERT DATA { <https://pod.test/alice/contacts/Group/b4e9fd85-3b38-4db7-8599-d0eda0b2ac74/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "best friends" .
<https://pod.test/alice/contacts/Group/b4e9fd85-3b38-4db7-8599-d0eda0b2ac74/index.ttl#this> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#Group> .
 }`,
    );
  });
});
