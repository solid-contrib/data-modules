import { addAddressBookToTypeIndex } from "./addAddressBookToTypeIndex";
import { st, sym } from "rdflib";
import { solid } from "../namespaces";
import { generateId } from "../generate-id";
import { when } from "jest-when";

jest.mock("../generate-id");

describe("addAddressBookToTypeIndex", () => {
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
