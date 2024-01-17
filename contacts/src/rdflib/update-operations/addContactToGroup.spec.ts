import { addContactToGroup } from "./addContactToGroup";
import { ContactQuery } from "../queries";
import { GroupQuery } from "../queries/GroupQuery";
import { lit, st, sym } from "rdflib";
import { vcard } from "../namespaces";

describe("addContactToGroup", () => {
  it("adds the contact as a group member", () => {
    const contactNode = sym("https://pod.test/contact#this");
    const groupNode = sym("https://pod.test/group#this");

    const result = addContactToGroup(
      { contactNode, queryName: () => "any" } as ContactQuery,
      { groupNode } as GroupQuery,
    );
    expect(result.insertions).toContainEqual(
      st(groupNode, vcard("hasMember"), contactNode, groupNode.doc()),
    );
  });

  it("adds the contact name to the group document", () => {
    const contactNode = sym("https://pod.test/contact#this");
    const groupNode = sym("https://pod.test/group#this");

    const result = addContactToGroup(
      { contactNode, queryName: () => "Alice" } as ContactQuery,
      { groupNode } as GroupQuery,
    );
    expect(result.insertions).toContainEqual(
      st(contactNode, vcard("fn"), lit("Alice"), groupNode.doc()),
    );
  });

  it("does not delete anything", () => {
    const contactNode = sym("https://pod.test/contact#this");
    const groupNode = sym("https://pod.test/group#this");

    const result = addContactToGroup(
      { contactNode, queryName: () => "any" } as ContactQuery,
      { groupNode } as GroupQuery,
    );
    expect(result.deletions).toEqual([]);
  });

  it("does not create any files", () => {
    const contactNode = sym("https://pod.test/contact#this");
    const groupNode = sym("https://pod.test/group#this");

    const result = addContactToGroup(
      { contactNode, queryName: () => "any" } as ContactQuery,
      { groupNode } as GroupQuery,
    );
    expect(result.filesToCreate).toEqual([]);
  });
});
