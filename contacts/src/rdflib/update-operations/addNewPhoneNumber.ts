import { UpdateOperation } from "./index.js";
import { NamedNode, st, sym } from "rdflib";
import { generateId } from "../generate-id.js";
import { vcard } from "../namespaces.js";

export function addNewPhoneNumber(
  contactNode: NamedNode,
  phoneNumber: string,
): UpdateOperation {
  const id = generateId();
  const uri = `${contactNode.doc().uri}#${id}`;
  return {
    uri,
    insertions: [
      st(contactNode, vcard("hasTelephone"), sym(uri), contactNode.doc()),
      st(
        sym(uri),
        vcard("value"),
        sym("tel:" + phoneNumber),
        contactNode.doc(),
      ),
    ],
    deletions: [],
    filesToCreate: [],
  };
}
