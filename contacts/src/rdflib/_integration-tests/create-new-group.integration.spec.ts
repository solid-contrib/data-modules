import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib.js";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import {
  expectPatchRequest,
  mockNotFound,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("create new group", () => {
  it("creates group resource", async () => {
    const authenticatedFetch = jest.fn();

    (generateId as jest.Mock).mockReturnValueOnce("b4e9fd85");

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
      "https://pod.test/alice/contacts/groups.ttl",
      "",
    );

    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/b4e9fd85/index.ttl",
    );

    const createdUri = await contacts.createNewGroup({
      addressBookUri: "https://pod.test/alice/contacts/index.ttl#this",
      groupName: "best friends",
    });

    expect(createdUri).toEqual(
      "https://pod.test/alice/contacts/Group/b4e9fd85/index.ttl#this",
    );
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/b4e9fd85/index.ttl",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/alice/contacts/Group/b4e9fd85/index.ttl#this> <http://www.w3.org/2006/vcard/ns#fn> "best friends" .
        <https://pod.test/alice/contacts/Group/b4e9fd85/index.ttl#this> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#Group> .
      };   a solid:InsertDeletePatch .`,
    );
  });
});
