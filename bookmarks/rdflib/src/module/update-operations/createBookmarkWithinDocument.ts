import { generateId } from "../../generate-id.js";
import { createBookmark } from "./createBookmark.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function createBookmarkWithinDocument(
  documentUri: string,
  title: string,
  url: string,
): UpdateOperation & { uri: string } {
  const id = generateId();
  const bookmarkUri = documentUri + "#" + id;
  return createBookmark(bookmarkUri, title, url);
}
