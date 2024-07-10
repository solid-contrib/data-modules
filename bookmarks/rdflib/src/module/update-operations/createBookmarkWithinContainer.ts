import { generateId } from "../../generate-id.js";
import { createBookmark } from "./createBookmark.js";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function createBookmarkWithinContainer(
  containerUri: string,
  title: string,
  url: string,
): UpdateOperation & { uri: string } {
  const id = generateId();
  const bookmarkUri = containerUri + id + "#it";
  return createBookmark(bookmarkUri, title, url);
}
