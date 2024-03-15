import { UpdateOperation } from "./index.js";
import { IndexedFormula, NamedNode, st } from "rdflib";
import { vcard } from "../namespaces.js";

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
    uri: "",
    insertions: [],
    deletions: [
      ...phoneStatements,
      st(contactNode, vcard("hasTelephone"), phoneNode, contactNode.doc()),
    ],
    filesToCreate: [],
  };
}
