import { lit, st } from "rdflib";
import { vcard } from "../namespaces.js";
import { ContactQuery } from "../queries/index.js";
import { GroupQuery } from "../queries/GroupQuery.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function removeContactFromGroup(
  contactQuery: ContactQuery,
  groupQuery: GroupQuery,
): UpdateOperation {
  const contactUri = contactQuery.contactNode.uri;
  const member = groupQuery.queryMembers().find((it) => it.uri === contactUri);
  if (!member) {
    throw new Error("member not found in group");
  }
  return {
    insertions: [],
    deletions: [
      st(
        groupQuery.groupNode,
        vcard("hasMember"),
        contactQuery.contactNode,
        groupQuery.groupNode.doc(),
      ),
      st(
        contactQuery.contactNode,
        vcard("fn"),
        lit(member.name),
        groupQuery.groupNode.doc(),
      ),
    ],
    filesToCreate: [],
  };
}
