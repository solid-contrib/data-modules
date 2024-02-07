import { ContactQuery } from "../queries/index.js";
import { GroupQuery } from "../queries/GroupQuery.js";
import { UpdateOperation } from "./index.js";
import { lit, st } from "rdflib";
import { vcard } from "../namespaces.js";

export function addContactToGroup(
  contactQuery: ContactQuery,
  groupQuery: GroupQuery,
): UpdateOperation {
  const name = contactQuery.queryName();
  return {
    uri: "",
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
