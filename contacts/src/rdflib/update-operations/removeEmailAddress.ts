import { UpdateOperation } from "./index.js";
import { IndexedFormula, NamedNode, st } from "rdflib";
import { vcard } from "../namespaces.js";

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
    uri: "",
    insertions: [],
    deletions: [
      ...emailStatements,
      st(contactNode, vcard("hasEmail"), emailNode, contactNode.doc()),
    ],
    filesToCreate: [],
  };
}
