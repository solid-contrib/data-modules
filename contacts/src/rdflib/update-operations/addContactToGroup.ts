import { ContactQuery } from "../queries/index.js";
import { GroupQuery } from "../queries/GroupQuery.js";
import { lit, st } from "rdflib";
import { vcard } from "../namespaces.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function addContactToGroup(
  contactQuery: ContactQuery,
  groupQuery: GroupQuery,
): UpdateOperation {
  const name = contactQuery.queryName();
  return {
    insertions: [
      st(
        groupQuery.groupNode,
        vcard("hasMember"),
        contactQuery.contactNode,
        groupQuery.groupNode.doc(),
      ),
      st(
        contactQuery.contactNode,
        vcard("fn"),
        lit(name),
        groupQuery.groupNode.doc(),
      ),
    ],
    deletions: [],
    filesToCreate: [],
  };
}
