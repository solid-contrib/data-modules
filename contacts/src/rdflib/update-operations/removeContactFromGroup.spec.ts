import { removeContactFromGroup } from "./removeContactFromGroup";
import { ContactQuery } from "../queries";
import { GroupQuery } from "../queries/GroupQuery";
import { st, sym } from "rdflib";
import { vcard } from "../namespaces";

describe("removeContactFromGroup", () => {
  it("removes the contact as a group member", () => {
    const contactNode = sym("https://pod.test/contact#this");
    const groupNode = sym("https://pod.test/group#this");

    const result = removeContactFromGroup(
      { contactNode, queryName: () => "any" } as ContactQuery,
      { groupNode } as GroupQuery,
    );
    expect(result.deletions).toContainEqual(
      st(groupNode, vcard("hasMember"), contactNode, groupNode.doc()),
    );
  });
});
