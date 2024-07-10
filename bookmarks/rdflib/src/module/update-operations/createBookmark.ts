import { lit, st, sym } from "rdflib";
import { rdf, UpdateOperation } from "@solid-data-modules/rdflib-utils";
import { bookm, dct, xsd } from "../namespaces.js";

export function createBookmark(
  bookmarkUri: string,
  title: string,
  url: string,
): UpdateOperation & { uri: string } {
  const bookmarkNode = sym(bookmarkUri);
  return {
    uri: bookmarkUri,
    deletions: [],
    insertions: [
      st(bookmarkNode, rdf("type"), bookm("Bookmark"), bookmarkNode.doc()),
      st(bookmarkNode, dct("title"), lit(title), bookmarkNode.doc()),
      st(bookmarkNode, bookm("recalls"), sym(url), bookmarkNode.doc()),
      st(
        bookmarkNode,
        dct("created"),
        lit(new Date().toISOString(), undefined, xsd("dateTime")),
        bookmarkNode.doc(),
      ),
    ],
    filesToCreate: [],
  };
}
