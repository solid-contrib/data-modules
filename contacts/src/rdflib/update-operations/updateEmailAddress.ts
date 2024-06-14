import { IndexedFormula, NamedNode, st, sym } from "rdflib";
import { vcard } from "../namespaces.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function updateEmailAddress(
  emailAddressNode: NamedNode,
  newEmailAddress: string,
  store: IndexedFormula,
): UpdateOperation {
  const oldValue = store.any(emailAddressNode, vcard("value"));
  const deletions = oldValue
    ? [st(emailAddressNode, vcard("value"), oldValue, emailAddressNode.doc())]
    : [];
  const insertions = [
    st(
      emailAddressNode,
      vcard("value"),
      sym("mailto:" + newEmailAddress),
      emailAddressNode.doc(),
    ),
  ];
  return {
    insertions,
    deletions,
    filesToCreate: [],
  };
}
