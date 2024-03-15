import { addNewPhoneNumber } from "./addNewPhoneNumber";
import { st, sym } from "rdflib";
import { generateId } from "../generate-id";
import { when } from "jest-when";
import { vcard } from "../namespaces";

jest.mock("../generate-id");

describe("addNewPhoneNumber", () => {
  it("returns the newly minted URI for the phone number resource", () => {
    when(generateId).mockReturnValue("abc123");
    const result = addNewPhoneNumber(
      sym("https://pod.test/contacts/1#this"),
      "1234",
    );
    expect(result.uri).toEqual("https://pod.test/contacts/1#abc123");
  });

  describe("insertions", () => {
    it("inserts the value for the phone number as a tel: URI", () => {
      when(generateId).mockReturnValue("abc123");
      const result = addNewPhoneNumber(
        sym("https://pod.test/contacts/1#this"),
        "1234",
      );
      expect(result.insertions).toContainEqual(
        st(
          sym("https://pod.test/contacts/1#abc123"),
          vcard("value"),
          sym("tel:1234"),
          sym("https://pod.test/contacts/1"),
        ),
      );
    });

    it("links the phone number to the contact", () => {
      when(generateId).mockReturnValue("abc123");
      const result = addNewPhoneNumber(
        sym("https://pod.test/contacts/1#this"),
        "1234",
      );
      expect(result.insertions).toContainEqual(
        st(
          sym("https://pod.test/contacts/1#this"),
          vcard("hasTelephone"),
          sym("https://pod.test/contacts/1#abc123"),
          sym("https://pod.test/contacts/1"),
        ),
      );
    });
  });
});
