import { IndexedFormula, NamedNode, st, sym } from "rdflib";
import { vcard } from "../namespaces.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function updatePhoneNumber(
  phoneNumberNode: NamedNode,
  newPhoneNumber: string,
  store: IndexedFormula,
): UpdateOperation {
  const oldValue = store.any(phoneNumberNode, vcard("value"));
  const deletions = oldValue
    ? [st(phoneNumberNode, vcard("value"), oldValue, phoneNumberNode.doc())]
    : [];
  const insertions = [
    st(
      phoneNumberNode,
      vcard("value"),
      sym("tel:" + newPhoneNumber),
      phoneNumberNode.doc(),
    ),
  ];
  return {
    insertions,
    deletions,
    filesToCreate: [],
  };
}
