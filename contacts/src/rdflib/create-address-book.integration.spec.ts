import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import { mockNotFound } from "../test-support/mockResponses";

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
});
