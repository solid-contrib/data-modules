import { IndexedFormula, lit, NamedNode, st } from "rdflib";
import { UpdateOperation } from "./index.js";
import { vcard } from "../namespaces.js";

export function renameContact(
  store: IndexedFormula,
  contactNode: NamedNode,
  newName: string,
): UpdateOperation {
  const deletions = store.statementsMatching(
    contactNode,
    vcard("fn"),
    null,
    null,
  );

  const insertions = deletions.map((it) =>
    st(it.subject, it.predicate, lit(newName), it.graph),
  );

  return {
    uri: "",
    insertions,
    deletions,
    filesToCreate: [],
  };
}
