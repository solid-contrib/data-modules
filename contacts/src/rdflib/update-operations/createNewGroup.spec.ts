import { sym } from "rdflib";
import { AddressBookQuery } from "../queries";
import { createNewGroup } from "./createNewGroup";

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
});
