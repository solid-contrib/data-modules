import { IndexedFormula, lit, NamedNode, st } from "rdflib";
import { vcard } from "../namespaces.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

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
    insertions,
    deletions,
    filesToCreate: [],
  };
}
