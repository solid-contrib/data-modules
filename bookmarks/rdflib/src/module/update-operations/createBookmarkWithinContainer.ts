import { UpdateOperation } from "./index.js";
import { generateId } from "../../generate-id.js";
import { createBookmark } from "./createBookmark.js";

export function createBookmarkWithinContainer(
  containerUri: string,
  title: string,
  url: string,
): UpdateOperation {
  const id = generateId();
  const bookmarkUri = containerUri + id + "#it";
  return createBookmark(bookmarkUri, title, url);
}
