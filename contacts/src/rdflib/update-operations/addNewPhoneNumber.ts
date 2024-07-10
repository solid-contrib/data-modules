import { NamedNode, st, sym } from "rdflib";
import { vcard } from "../namespaces.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";

export function addNewPhoneNumber(
  contactNode: NamedNode,
  phoneNumber: string,
): UpdateOperation & { uri: string } {
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
