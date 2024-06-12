import { UpdateOperation } from "./index.js";
import { generateId } from "../../generate-id.js";
import { createBookmark } from "./createBookmark.js";

export function createBookmarkWithinDocument(
  documentUri: string,
  title: string,
  url: string,
): UpdateOperation {
  const id = generateId();
  const bookmarkUri = documentUri + "#" + id;
  return createBookmark(bookmarkUri, title, url);
}
