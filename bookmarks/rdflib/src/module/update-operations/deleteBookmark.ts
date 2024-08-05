import { IndexedFormula, NamedNode } from "rdflib";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function deleteBookmark(
  store: IndexedFormula,
  bookmarkNode: NamedNode,
): UpdateOperation {
  const deletions = store.statementsMatching(
    bookmarkNode,
    null,
    null,
    bookmarkNode.doc(),
  );
  return {
    insertions: [],
    deletions,
    filesToCreate: [],
  };
}
