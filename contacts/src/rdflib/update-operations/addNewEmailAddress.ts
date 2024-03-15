import { UpdateOperation } from "./index.js";
import { NamedNode, st, sym } from "rdflib";
import { generateId } from "../generate-id.js";
import { vcard } from "../namespaces.js";

export function addNewEmailAddress(
  contactNode: NamedNode,
  emailAddress: string,
): UpdateOperation {
  const id = generateId();
  const uri = `${contactNode.doc().uri}#${id}`;
  return {
    uri,
    insertions: [
      st(contactNode, vcard("hasEmail"), sym(uri), contactNode.doc()),
      st(
        sym(uri),
        vcard("value"),
        sym("mailto:" + emailAddress),
        contactNode.doc(),
      ),
    ],
    deletions: [],
    filesToCreate: [],
  };
}
