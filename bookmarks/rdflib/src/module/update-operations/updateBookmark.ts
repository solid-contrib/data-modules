import { IndexedFormula, lit, NamedNode, st, sym } from "rdflib";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";
import { bookm, dct, xsd } from "../namespaces.js";

export function updateBookmark(
  store: IndexedFormula,
  bookmarkNode: NamedNode,
  newTitle?: string,
  newUrl?: string,
): UpdateOperation {
  const insertions = [
    st(
      bookmarkNode,
      dct("modified"),
      lit(new Date().toISOString(), undefined, xsd("dateTime")),
      bookmarkNode.doc(),
    ),
  ];

  const titleDeletions = store.statementsMatching(
    bookmarkNode,
    dct("title"),
    null,
    bookmarkNode.doc(),
  );
  const urlDeletions = store.statementsMatching(
    bookmarkNode,
    bookm("recalls"),
    null,
    bookmarkNode.doc(),
  );
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
    deletions: [...titleDeletions, ...urlDeletions],
    filesToCreate: [],
  };
}
