import { IndexedFormula, NamedNode, st } from "rdflib";
import { vcard } from "../namespaces.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function removeEmailAddress(
  contactNode: NamedNode,
  emailNode: NamedNode,
  store: IndexedFormula,
): UpdateOperation {
  const emailStatements = store.statementsMatching(
    emailNode,
    null,
    null,
    emailNode.doc(),
  );
  return {
    insertions: [],
    deletions: [
      ...emailStatements,
      st(contactNode, vcard("hasEmail"), emailNode, contactNode.doc()),
    ],
    filesToCreate: [],
  };
}
