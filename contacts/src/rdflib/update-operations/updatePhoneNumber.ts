import { UpdateOperation } from "./index.js";
import { IndexedFormula, NamedNode, st } from "rdflib";
import { vcard } from "../namespaces.js";

export function updatePhoneNumber(
  phoneNumberNode: NamedNode,
  newPhoneNumber: string,
  store: IndexedFormula,
): UpdateOperation {
  const oldValue = store.any(phoneNumberNode, vcard("value"));
  const deletions = oldValue
    ? [st(phoneNumberNode, vcard("value"), oldValue, phoneNumberNode.doc())]
    : [];
  return {
    uri: "",
    insertions: [],
    deletions,
    filesToCreate: [],
  };
}
