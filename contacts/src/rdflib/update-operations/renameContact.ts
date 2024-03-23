import { lit, st } from "rdflib";
import { UpdateOperation } from "./index.js";
import { vcard } from "../namespaces.js";
import { ContactQuery } from "../queries/ContactQuery.js";

export function renameContact(
  contactQuery: ContactQuery,
  newName: string,
): UpdateOperation {
  return {
    uri: "",
    insertions: [
      st(
        contactQuery.contactNode,
        vcard("fn"),
        lit(newName),
        contactQuery.contactNode.doc(),
      ),
    ],
    deletions: [
      st(
        contactQuery.contactNode,
        vcard("fn"),
        lit(contactQuery.queryName()),
        contactQuery.contactNode.doc(),
      ),
    ],
    filesToCreate: [],
  };
}
