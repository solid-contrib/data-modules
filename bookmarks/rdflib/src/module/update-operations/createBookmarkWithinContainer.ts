import { UpdateOperation } from "./index.js";
import { generateId } from "../../generate-id.js";
import { lit, st, sym } from "rdflib";

export function createBookmarkWithinContainer(
  containerUri: string,
  title: string,
  url: string,
): UpdateOperation {
  const id = generateId();
  const uri = containerUri + id + "#it";
  const bookmarkNode = sym(uri);
  return {
    uri,
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
    ],
    filesToCreate: [],
  };
}
