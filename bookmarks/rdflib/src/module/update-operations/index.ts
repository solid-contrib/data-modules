import { Statement } from "rdflib";

export { createBookmarkWithinContainer } from "./createBookmarkWithinContainer.js";

export interface FileToCreate {
  uri: string;
}

export interface UpdateOperation {
  uri: string;
  insertions: Statement[];
  deletions: Statement[];
  filesToCreate: FileToCreate[];
}
