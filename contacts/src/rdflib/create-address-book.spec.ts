import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import { mockNotFound } from "../test-support/mockResponses";

import { v4 as uuid } from "uuid";

jest.mock("uuid");

describe("create address book", () => {
  it("creates the address book resource", async () => {
    const authenticatedFetch = jest.fn();

    (uuid as jest.Mock).mockReturnValue("c1eabcdb-fd69-4889-9ab2-f06be49d27d3");

    const contacts = new ContactsModuleRdfLib({
      fetch: authenticatedFetch,
    });

    mockNotFound(
      authenticatedFetch,
      "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl",
    );

    const createdUri = await contacts.createAddressBook({
      container: "https://pod.test/alice/",
      name: "My Contacts",
    });

    expect(createdUri).toEqual(
      "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl#this",
    );

    expect(authenticatedFetch).toHaveBeenCalledWith(
      "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl",
      expect.anything(),
    );

    const calls = authenticatedFetch.mock.calls;
    const updateRequest = calls.find(
      (it) =>
        it[0] ===
          "https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl" &&
        it[1].method === "PATCH",
    );
    expect(updateRequest).toBeDefined();
    const body = updateRequest[1].body;
    expect(body.trim()).toEqual(
      `INSERT DATA { <https://pod.test/alice/c1eabcdb-fd69-4889-9ab2-f06be49d27d3/index.ttl#this> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
 }`,
    );
  });
});
