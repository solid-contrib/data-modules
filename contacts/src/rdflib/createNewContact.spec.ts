import { createNewContact } from "./createNewContact";
import { AddressBookQuery } from "./AddressBookQuery";
import { lit, st, sym } from "rdflib";
import { vcard } from "./namespaces";

describe("createNewContact", () => {
  it("returns the uri of the new contact", () => {
    const addressBookQuery = {
      proposeNewContactNode: () =>
        sym(
          "https://pod.test/contacts/Person/80363534-f3d1-455e-a3d9-b29dcbb755d2/index.ttl#this",
        ),
      queryNameEmailIndex: () => sym("https://pod.test/contacts/people.ttl"),
    } as unknown as AddressBookQuery;
    const result = createNewContact(addressBookQuery, {
      name: "anyone",
    });
    expect(result.uri).toEqual(
      "https://pod.test/contacts/Person/80363534-f3d1-455e-a3d9-b29dcbb755d2/index.ttl#this",
    );
  });

  it("returns no deletions", () => {
    const addressBookQuery = {
      proposeNewContactNode: () =>
        sym(
          "https://pod.test/contacts/Person/80363534-f3d1-455e-a3d9-b29dcbb755d2/index.ttl#this",
        ),
      queryNameEmailIndex: () => sym("https://pod.test/contacts/people.ttl"),
    } as unknown as AddressBookQuery;
    const result = createNewContact(addressBookQuery, {
      name: "anyone",
    });
    expect(result.deletions).toEqual([]);
  });

  it("does not create any plain files", () => {
    const addressBookQuery = {
      proposeNewContactNode: () =>
        sym(
          "https://pod.test/contacts/Person/80363534-f3d1-455e-a3d9-b29dcbb755d2/index.ttl#this",
        ),
      queryNameEmailIndex: () => sym("https://pod.test/contacts/people.ttl"),
    } as unknown as AddressBookQuery;
    const result = createNewContact(addressBookQuery, {
      name: "anyone",
    });
    expect(result.filesToCreate).toEqual([]);
  });

  it("throws an error if name-email index is missing", () => {
    const addressBookQuery = {
      proposeNewContactNode: () =>
        sym(
          "https://pod.test/contacts/Person/80363534-f3d1-455e-a3d9-b29dcbb755d2/index.ttl#this",
        ),
      queryNameEmailIndex: () => null,
    } as unknown as AddressBookQuery;
    expect(() =>
      createNewContact(addressBookQuery, {
        name: "anyone",
      }),
    ).toThrow(new Error("name-email index is missing or invalid"));
  });

  it("inserts the contact name to the nameEmailIndex", () => {
    const addressBookQuery = {
      proposeNewContactNode: () =>
        sym(
          "https://pod.test/contacts/Person/80363534-f3d1-455e-a3d9-b29dcbb755d2/index.ttl#this",
        ),
      queryNameEmailIndex: () => sym("https://pod.test/contacts/people.ttl"),
    } as unknown as AddressBookQuery;
    const result = createNewContact(addressBookQuery, {
      name: "Zinnia Lisa",
    });
    expect(result.insertions).toContainEqual(
      st(
        sym(
          "https://pod.test/contacts/Person/80363534-f3d1-455e-a3d9-b29dcbb755d2/index.ttl#this",
        ),
        vcard("fn"),
        lit("Zinnia Lisa"),
        sym("https://pod.test/contacts/people.ttl"),
      ),
    );
  });
});
