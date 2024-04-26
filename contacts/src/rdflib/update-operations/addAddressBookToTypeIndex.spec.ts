import { addAddressBookToTypeIndex } from "./addAddressBookToTypeIndex";
import { st, sym } from "rdflib";
import { rdf, solid, vcard } from "../namespaces";
import { generateId } from "../generate-id";
import { when } from "jest-when";

jest.mock("../generate-id");

describe("addAddressBookToTypeIndex", () => {
  it("creates a new type registration for address books", () => {
    when(generateId).mockReturnValue("74807edb");
    const operation = addAddressBookToTypeIndex(
      sym("https://alice.test/settings/privateTypeIndex.ttl"),
      "https://alice.test/contacts/1#this",
    );
    expect(operation.insertions).toContainEqual(
      st(
        sym("https://alice.test/settings/privateTypeIndex.ttl#74807edb"),
        rdf("type"),
        solid("TypeRegistration"),
        sym("https://alice.test/settings/privateTypeIndex.ttl"),
      ),
    );
    expect(operation.insertions).toContainEqual(
      st(
        sym("https://alice.test/settings/privateTypeIndex.ttl#74807edb"),
        solid("forClass"),
        vcard("AddressBook"),
        sym("https://alice.test/settings/privateTypeIndex.ttl"),
      ),
    );
  });

  it("links the instance to the registration", () => {
    when(generateId).mockReturnValue("74807edb");
    const operation = addAddressBookToTypeIndex(
      sym("https://alice.test/settings/privateTypeIndex.ttl"),
      "https://alice.test/contacts/1#this",
    );
    expect(operation.insertions).toContainEqual(
      st(
        sym("https://alice.test/settings/privateTypeIndex.ttl#74807edb"),
        solid("instance"),
        sym("https://alice.test/contacts/1#this"),
        sym("https://alice.test/settings/privateTypeIndex.ttl"),
      ),
    );
  });
});
