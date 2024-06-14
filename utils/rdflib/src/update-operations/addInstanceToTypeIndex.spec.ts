import { addInstanceToTypeIndex } from "./addInstanceToTypeIndex";
import { st, sym } from "rdflib";
import { rdf, solid } from "../namespaces";
import { when } from "jest-when";
import { generateId } from "../identifier/index.js";

jest.mock("../identifier/index.js");

describe("addInstanceToTypeIndex", () => {
  it("creates a new type registration for type", () => {
    when(generateId).mockReturnValue("74807edb");
    const operation = addInstanceToTypeIndex(
      sym("https://alice.test/settings/privateTypeIndex.ttl"),
      "https://alice.test/contacts/1#this",
      sym("http://www.w3.org/2006/vcard/ns#AddressBook"),
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
        sym("http://www.w3.org/2006/vcard/ns#AddressBook"),
        sym("https://alice.test/settings/privateTypeIndex.ttl"),
      ),
    );
  });

  it("links the instance to the registration", () => {
    when(generateId).mockReturnValue("74807edb");
    const operation = addInstanceToTypeIndex(
      sym("https://alice.test/settings/privateTypeIndex.ttl"),
      "https://alice.test/contacts/1#this",
      sym("http://www.w3.org/2006/vcard/ns#AddressBook"),
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
