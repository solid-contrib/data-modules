import { UpdateOperation } from "./index";
import { lit, st } from "rdflib";
import { vcard } from "../namespaces";
import { ContactQuery } from "../queries";
import { GroupQuery } from "../queries/GroupQuery";

export function removeContactFromGroup(
  contactQuery: ContactQuery,
  groupQuery: GroupQuery,
): UpdateOperation {
  return {
    uri: "",
    insertions: [],
    deletions: [
      st(
        groupQuery.groupNode,
        vcard("hasMember"),
        contactQuery.contactNode,
        groupQuery.groupNode.doc(),
      ),
    ],
    filesToCreate: [],
  };
}
