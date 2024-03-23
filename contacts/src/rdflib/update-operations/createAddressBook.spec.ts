import { createAddressBook } from "./createAddressBook";
import { generateId } from "../generate-id";
import { lit, st, sym } from "rdflib";
import { dc, vcard } from "../namespaces.js";
import { UpdateOperation } from "./index.js";

jest.mock("../generate-id");

describe("createAddressBook", () => {
  it("generates a URI for the new address book based on the container and a random id", () => {
    // given
    (generateId as jest.Mock).mockReturnValueOnce("yt4Xx5nHMB");
    // when
    const result = createAddressBook(
      "https://pod.test/container/",
      "Test addresses",
    );
    expect(result.uri).toEqual(
      "https://pod.test/container/yt4Xx5nHMB/index.ttl#this",
    );
  });
  it("does not prepare any deletions", () => {
    const result = createAddressBook(
      "https://pod.test/container/",
      "Test addresses",
    );
    expect(result.deletions).toEqual([]);
  });

  describe("insertions", () => {
    let result: UpdateOperation;
    beforeEach(() => {
      (generateId as jest.Mock).mockReturnValueOnce("e8Civ0HoDy");
      result = createAddressBook(
        "https://pod.test/container/",
        "Test addresses",
      );
    });
    it("contain the vcard:AddressBook type", () => {
      expect(result.insertions).toContainEqual(
        st(
          sym(result.uri),
          sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          vcard("AddressBook"),
          sym(result.uri).doc(),
        ),
      );
    });
    it("contain the dc:title", () => {
      expect(result.insertions).toContainEqual(
        st(
          sym(result.uri),
          dc("title"),
          lit("Test addresses"),
          sym(result.uri).doc(),
        ),
      );
    });
    it("contain the vcard:nameEmailIndex", () => {
      expect(result.insertions).toContainEqual(
        st(
          sym(result.uri),
          vcard("nameEmailIndex"),
          sym("https://pod.test/container/e8Civ0HoDy/people.ttl"),
          sym(result.uri).doc(),
        ),
      );
    });
    it("contain the vcard:groupIndex", () => {
      expect(result.insertions).toContainEqual(
        st(
          sym(result.uri),
          vcard("groupIndex"),
          sym("https://pod.test/container/e8Civ0HoDy/groups.ttl"),
          sym(result.uri).doc(),
        ),
      );
    });
  });

  describe("files to create", () => {
    let result: UpdateOperation;
    beforeEach(() => {
      (generateId as jest.Mock).mockReturnValueOnce("iPjiGoHXAK");
      result = createAddressBook(
        "https://pod.test/container/",
        "Test addresses",
      );
    });

    it("include the name email index", () => {
      expect(result.filesToCreate).toContainEqual({
        uri: "https://pod.test/container/iPjiGoHXAK/people.ttl",
      });
    });

    it("include the group index", () => {
      expect(result.filesToCreate).toContainEqual({
        uri: "https://pod.test/container/iPjiGoHXAK/groups.ttl",
      });
    });
  });
});
