import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import { mockNotFound } from "../test-support/mockResponses";

import { v4 as uuid } from "uuid";
import {
  expectPatchRequest,
  expectPutEmptyTurtleFile,
} from "../test-support/expectRequests";
import { Fetcher, graph, UpdateManager } from "rdflib";

jest.mock("uuid");

describe("create address book", () => {
  it("creates the address book resource", async () => {
    const authenticatedFetch = jest.fn();

    (uuid as jest.Mock).mockReturnValueOnce(
      "c1eabcdb-fd69-4889-9ab2-f06be49d27d3",
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

    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl",
    );
    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/people.ttl",
    );
    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/groups.ttl",
    );

    const createdUri = await contacts.createAddressBook({
      containerUri: "https://pod.test/alice/",
      name: "My Contacts",
    });

    expect(createdUri).toEqual(
      "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl#this",
    );
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl",
      `INSERT DATA { <https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl#this> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
<https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl#this> <http://purl.org/dc/elements/1.1/title> "My Contacts" .
<https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl#this> <http://www.w3.org/2006/vcard/ns#nameEmailIndex> <https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/people.ttl> .
<https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl#this> <http://www.w3.org/2006/vcard/ns#groupIndex> <https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/groups.ttl> .
 }`,
    );
    expectPutEmptyTurtleFile(
      authenticatedFetch,
      "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/people.ttl",
    );
    expectPutEmptyTurtleFile(
      authenticatedFetch,
      "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/groups.ttl",
    );
  });
});
