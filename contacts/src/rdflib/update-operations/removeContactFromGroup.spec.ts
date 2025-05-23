import { removeContactFromGroup } from "./removeContactFromGroup.js";
import { ContactQuery } from "../queries/index.js";
import { GroupQuery } from "../queries/GroupQuery.js";
import { lit, st, sym } from "rdflib";
import { vcard } from "../namespaces.js";

describe("removeContactFromGroup", () => {
  it("removes the contact as a group member", () => {
    const contactNode = sym("https://pod.test/contact#this");
    const groupNode = sym("https://pod.test/group#this");

    const result = removeContactFromGroup(
      { contactNode, queryName: () => "any" } as ContactQuery,
      {
        groupNode,
        queryMembers: () => [{ uri: "https://pod.test/contact#this" }],
      } as GroupQuery,
    );
    expect(result.deletions).toContainEqual(
      st(groupNode, vcard("hasMember"), contactNode, groupNode.doc()),
    );
  });

  it("throws an error if member not found in group", () => {
    const contactNode = sym("https://pod.test/contact#this");
    const groupNode = sym("https://pod.test/group#this");

    expect(() =>
      removeContactFromGroup(
        { contactNode } as ContactQuery,
        {
          groupNode,
          queryMembers: () => [{}],
        } as GroupQuery,
      ),
    ).toThrow(new Error("member not found in group"));
  });

  it("removes the contact name from the group document", () => {
    const contactNode = sym("https://pod.test/contact#this");
    const groupNode = sym("https://pod.test/group#this");

    const result = removeContactFromGroup(
      { contactNode } as ContactQuery,
      {
        groupNode,
        queryMembers: () => [
          { uri: "https://pod.test/contact#this", name: "Alice" },
        ],
      } as GroupQuery,
    );
    expect(result.deletions).toContainEqual(
      st(contactNode, vcard("fn"), lit("Alice"), groupNode.doc()),
    );
  });

  it("does not insert anything", () => {
    const contactNode = sym("https://pod.test/contact#this");
    const groupNode = sym("https://pod.test/group#this");

    const result = removeContactFromGroup(
      { contactNode } as ContactQuery,
      {
        groupNode,
        queryMembers: () => [{ uri: "https://pod.test/contact#this" }],
      } as GroupQuery,
    );
    expect(result.insertions).toEqual([]);
  });

  it("does not create any files", () => {
    const contactNode = sym("https://pod.test/contact#this");
    const groupNode = sym("https://pod.test/group#this");

    const result = removeContactFromGroup(
      { contactNode } as ContactQuery,
      {
        groupNode,
        queryMembers: () => [{ uri: "https://pod.test/contact#this" }],
      } as GroupQuery,
    );
    expect(result.filesToCreate).toEqual([]);
  });
});
