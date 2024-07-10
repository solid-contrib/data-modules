import { lit, st, sym } from "rdflib";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

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
      st(
        bookmarkNode,
        sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        sym("http://www.w3.org/2002/01/bookmark#Bookmark"),
        bookmarkNode.doc(),
      ),
      st(
        bookmarkNode,
        sym("http://purl.org/dc/terms/title"),
        lit(title),
        bookmarkNode.doc(),
      ),
      st(
        bookmarkNode,
        sym("http://www.w3.org/2002/01/bookmark#recalls"),
        sym(url),
        bookmarkNode.doc(),
      ),
      st(
        bookmarkNode,
        sym("http://purl.org/dc/terms/created"),
        lit(
          new Date().toISOString(),
          undefined,
          sym("http://www.w3.org/2001/XMLSchema#dateTime"),
        ),
        bookmarkNode.doc(),
      ),
    ],
    filesToCreate: [],
  };
}
