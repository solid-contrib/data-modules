import { lit, st, sym } from "rdflib";
import { AddressBookQuery } from "../queries";
import { createNewGroup } from "./createNewGroup";
import { vcard } from "../namespaces";
import { rdf } from "@solid-data-modules/rdflib-utils";

describe("createNewGroup", () => {
  it("returns the uri of the new group", () => {
    const addressBookQuery = {
      proposeNewGroupNode: () =>
        sym(
          "https://pod.test/contacts/Group/a426de26-b51c-4540-8068-10d0ac175cd7/index.ttl#this",
        ),
      queryGroupIndex: () => sym("https://pod.test/contacts/groups.ttl"),
    } as unknown as AddressBookQuery;
    const result = createNewGroup(addressBookQuery, "anything");
    expect(result.uri).toEqual(
      "https://pod.test/contacts/Group/a426de26-b51c-4540-8068-10d0ac175cd7/index.ttl#this",
    );
  });

  it("returns no deletions", () => {
    const addressBookQuery = {
      proposeNewGroupNode: () =>
        sym(
          "https://pod.test/contacts/Group/a426de26-b51c-4540-8068-10d0ac175cd7/index.ttl#this",
        ),
      queryGroupIndex: () => sym("https://pod.test/contacts/groups.ttl"),
    } as unknown as AddressBookQuery;
    const result = createNewGroup(addressBookQuery, "anything");
    expect(result.deletions).toEqual([]);
  });

  it("does not create any plain files", () => {
    const addressBookQuery = {
      proposeNewGroupNode: () =>
        sym(
          "https://pod.test/contacts/Group/a426de26-b51c-4540-8068-10d0ac175cd7/index.ttl#this",
        ),
      queryGroupIndex: () => sym("https://pod.test/contacts/groups.ttl"),
    } as unknown as AddressBookQuery;
    const result = createNewGroup(addressBookQuery, "anything");
    expect(result.filesToCreate).toEqual([]);
  });

  it("throws an error if group index is missing", () => {
    const addressBookQuery = {
      proposeNewGroupNode: () =>
        sym(
          "https://pod.test/contacts/Group/a426de26-b51c-4540-8068-10d0ac175cd7/index.ttl#this",
        ),
      queryGroupIndex: () => null,
    } as unknown as AddressBookQuery;
    expect(() => createNewGroup(addressBookQuery, "anything")).toThrow(
      new Error("group index is missing or invalid"),
    );
  });

  describe("insertions", () => {
    let addressBookQuery: AddressBookQuery;
    const newGroupNode = sym(
      "https://pod.test/contacts/Group/a426de26-b51c-4540-8068-10d0ac175cd7/index.ttl#this",
    );
    beforeEach(() => {
      addressBookQuery = {
        addressBookNode: sym("https://pod.test/contacts/index.ttl#this"),
        proposeNewGroupNode: () => newGroupNode,
        queryGroupIndex: () => sym("https://pod.test/contacts/groups.ttl"),
      } as unknown as AddressBookQuery;
    });

    it("inserts the group name to the groupIndex", () => {
      const result = createNewGroup(addressBookQuery, "best friends");
      expect(result.insertions).toContainEqual(
        st(
          newGroupNode,
          vcard("fn"),
          lit("best friends"),
          sym("https://pod.test/contacts/groups.ttl"),
        ),
      );
    });

    it("inserts the group name to the group document", () => {
      const result = createNewGroup(addressBookQuery, "best friends");
      expect(result.insertions).toContainEqual(
        st(newGroupNode, vcard("fn"), lit("best friends"), newGroupNode.doc()),
      );
    });

    it("adds a type to the new group", () => {
      const result = createNewGroup(addressBookQuery, "anything");
      expect(result.insertions).toContainEqual(
        st(newGroupNode, rdf("type"), vcard("Group"), newGroupNode.doc()),
      );
    });

    it("adds the group to the address book", () => {
      const result = createNewGroup(addressBookQuery, "anything");
      expect(result.insertions).toContainEqual(
        st(
          addressBookQuery.addressBookNode,
          vcard("includesGroup"),
          newGroupNode,
          sym("https://pod.test/contacts/groups.ttl"),
        ),
      );
    });
  });
});
