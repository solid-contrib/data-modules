import { createAddressBook, UpdateOperation } from "./createAddressBook";
import { v4 as uuid } from "uuid";
import { lit, st, sym } from "rdflib";
import { dc, vcard } from "./namespaces";

jest.mock("uuid");

describe("createAddressBook", () => {
  it("generates a URI for the new address book based on the container and a random uuid", () => {
    // given
    (uuid as jest.Mock).mockReturnValueOnce(
      "4b7f70e2-a30a-474b-9eb7-8301f8bd56b0",
    );
    // when
    const result = createAddressBook(
      "https://pod.test/container/",
      "Test addresses",
    );
    expect(result.uri).toEqual(
      "https://pod.test/container/4b7f70e2-a30a-474b-9eb7-8301f8bd56b0/index.ttl#this",
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
      (uuid as jest.Mock).mockReturnValueOnce(
        "b66d3267-fca0-400f-80c0-ab9ff7a7c77d",
      );
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
          sym(
            "https://pod.test/container/b66d3267-fca0-400f-80c0-ab9ff7a7c77d/people.ttl",
          ),
          sym(result.uri).doc(),
        ),
      );
    });
    it("contain the vcard:groupIndex", () => {
      expect(result.insertions).toContainEqual(
        st(
          sym(result.uri),
          vcard("groupIndex"),
          sym(
            "https://pod.test/container/b66d3267-fca0-400f-80c0-ab9ff7a7c77d/groups.ttl",
          ),
          sym(result.uri).doc(),
        ),
      );
    });
  });

  describe("files to create", () => {
    let result: UpdateOperation;
    beforeEach(() => {
      (uuid as jest.Mock).mockReturnValueOnce(
        "7b93245b-1d43-48da-832e-c40e62032a05",
      );
      result = createAddressBook(
        "https://pod.test/container/",
        "Test addresses",
      );
    });

    it("include the name email index", () => {
      expect(result.filesToCreate).toContainEqual({
        uri: "https://pod.test/container/7b93245b-1d43-48da-832e-c40e62032a05/people.ttl",
      });
    });

    it("include the group index", () => {
      expect(result.filesToCreate).toContainEqual({
        uri: "https://pod.test/container/7b93245b-1d43-48da-832e-c40e62032a05/groups.ttl",
      });
    });
  });
});
