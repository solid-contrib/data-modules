import { addNewEmailAddress } from "./addNewEmailAddress.js";
import { st, sym } from "rdflib";
import { when } from "jest-when";
import { vcard } from "../namespaces.js";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("addNewEmailAddress", () => {
  it("returns the newly minted URI for the email address resource", () => {
    when(generateId).mockReturnValue("abc123");
    const result = addNewEmailAddress(
      sym("https://pod.test/contacts/1#this"),
      "alice@mail.test",
    );
    expect(result.uri).toEqual("https://pod.test/contacts/1#abc123");
  });

  describe("insertions", () => {
    it("inserts the value for the email address as a mailto: URI", () => {
      when(generateId).mockReturnValue("abc123");
      const result = addNewEmailAddress(
        sym("https://pod.test/contacts/1#this"),
        "alice@mail.test",
      );
      expect(result.insertions).toContainEqual(
        st(
          sym("https://pod.test/contacts/1#abc123"),
          vcard("value"),
          sym("mailto:alice@mail.test"),
          sym("https://pod.test/contacts/1"),
        ),
      );
    });

    it("links the email address to the contact", () => {
      when(generateId).mockReturnValue("abc123");
      const result = addNewEmailAddress(
        sym("https://pod.test/contacts/1#this"),
        "1234",
      );
      expect(result.insertions).toContainEqual(
        st(
          sym("https://pod.test/contacts/1#this"),
          vcard("hasEmail"),
          sym("https://pod.test/contacts/1#abc123"),
          sym("https://pod.test/contacts/1"),
        ),
      );
    });
  });
});
