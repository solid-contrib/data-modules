import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import {
  mockNotFound,
  mockTurtleResponse,
} from "../test-support/mockResponses";

import { generateId } from "./generate-id";
import {
  expectPatchRequest,
  expectPutEmptyTurtleFile,
} from "../test-support/expectRequests";
import { Fetcher, graph, UpdateManager } from "rdflib";

jest.mock("./generate-id");

describe("create address book", () => {
  it("creates the address book resource", async () => {
    const authenticatedFetch = jest.fn();

    (generateId as jest.Mock).mockReturnValueOnce("n528gSMwTN");

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

    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/n528gSMwTN/index.ttl",
    );
    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/n528gSMwTN/people.ttl",
    );
    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/n528gSMwTN/groups.ttl",
    );

    const createdUri = await contacts.createAddressBook({
      containerUri: "https://pod.test/alice/",
      name: "My Contacts",
    });

    expect(createdUri).toEqual(
      "https://pod.test/alice/n528gSMwTN/index.ttl#this",
    );
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/n528gSMwTN/index.ttl",
      `INSERT DATA { <https://pod.test/alice/n528gSMwTN/index.ttl#this> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
<https://pod.test/alice/n528gSMwTN/index.ttl#this> <http://purl.org/dc/elements/1.1/title> "My Contacts" .
<https://pod.test/alice/n528gSMwTN/index.ttl#this> <http://www.w3.org/2006/vcard/ns#nameEmailIndex> <https://pod.test/alice/n528gSMwTN/people.ttl> .
<https://pod.test/alice/n528gSMwTN/index.ttl#this> <http://www.w3.org/2006/vcard/ns#groupIndex> <https://pod.test/alice/n528gSMwTN/groups.ttl> .
 }`,
    );
    expectPutEmptyTurtleFile(
      authenticatedFetch,
      "https://pod.test/alice/n528gSMwTN/people.ttl",
    );
    expectPutEmptyTurtleFile(
      authenticatedFetch,
      "https://pod.test/alice/n528gSMwTN/groups.ttl",
    );
  });

  it("updates the private type index, if owner is given", async () => {
    const authenticatedFetch = jest.fn();

    (generateId as jest.Mock)
      .mockReturnValueOnce("b6edf2b9")
      .mockReturnValueOnce("3b6e");

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
      "https://pod.test/alice/profile/card",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
    @prefix pim: <http://www.w3.org/ns/pim/space#>.
  
    <#me> a vcard:Individual;
        vcard:fn "Alice";
        pim:preferencesFile <https://pod.test/alice/settings/prefs.ttl> ;
        .
`,
    );

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/settings/prefs.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
  
    <https://pod.test/alice/profile/card#me> 
        solid:privateTypeIndex <https://pod.test/alice/settings/privateTypeIndex.ttl> ;
        .
`,
    );

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/settings/privateTypeIndex.ttl",
      ``,
    );

    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/b6edf2b9/index.ttl",
    );
    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/b6edf2b9/people.ttl",
    );
    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/b6edf2b9/groups.ttl",
    );

    await contacts.createAddressBook({
      containerUri: "https://pod.test/alice/",
      name: "My Contacts",
      ownerWebId: "https://pod.test/alice/profile/card#me",
    });

    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/settings/privateTypeIndex.ttl",
      `INSERT DATA { <https://pod.test/alice/settings/privateTypeIndex.ttl#3b6e> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/solid/terms#TypeRegistration> .
<https://pod.test/alice/settings/privateTypeIndex.ttl#3b6e> <http://www.w3.org/ns/solid/terms#forClass> <http://www.w3.org/2006/vcard/ns#AddressBook> .
<https://pod.test/alice/settings/privateTypeIndex.ttl#3b6e> <http://www.w3.org/ns/solid/terms#instance> <https://pod.test/alice/b6edf2b9/index.ttl#this> .
 }`,
    );
  });
});
