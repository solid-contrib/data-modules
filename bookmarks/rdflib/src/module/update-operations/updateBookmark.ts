import { IndexedFormula, lit, NamedNode, st, sym } from "rdflib";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";
import { bookm, dct } from "../namespaces.js";

export function updateBookmark(
  store: IndexedFormula,
  bookmarkNode: NamedNode,
  newTitle?: string,
  newUrl?: string,
): UpdateOperation {
  const insertions = [];
  if (newTitle) {
    insertions.push(
      st(bookmarkNode, dct("title"), lit(newTitle), bookmarkNode.doc()),
    );
  }
  if (newUrl) {
    insertions.push(
      st(bookmarkNode, bookm("recalls"), sym(newUrl), bookmarkNode.doc()),
    );
  }
  return {
    insertions,
    deletions: [],
    filesToCreate: [],
  };
}
