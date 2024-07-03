import { NamedNode, st, sym } from "rdflib";
import { vcard } from "../namespaces.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";

export function addNewEmailAddress(
  contactNode: NamedNode,
  emailAddress: string,
): UpdateOperation & { uri: string } {
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
