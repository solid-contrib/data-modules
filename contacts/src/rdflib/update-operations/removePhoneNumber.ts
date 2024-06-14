import { IndexedFormula, NamedNode, st } from "rdflib";
import { vcard } from "../namespaces.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function removePhoneNumber(
  contactNode: NamedNode,
  phoneNode: NamedNode,
  store: IndexedFormula,
): UpdateOperation {
  const phoneStatements = store.statementsMatching(
    phoneNode,
    null,
    null,
    phoneNode.doc(),
  );
  return {
    insertions: [],
    deletions: [
      ...phoneStatements,
      st(contactNode, vcard("hasTelephone"), phoneNode, contactNode.doc()),
    ],
    filesToCreate: [],
  };
}
