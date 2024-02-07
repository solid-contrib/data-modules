import { Statement } from "rdflib";

export { createAddressBook } from "./createAddressBook.js";
export { createNewContact } from "./createNewContact.js";

export interface FileToCreate {
  uri: string;
}

export interface UpdateOperation {
  uri: string;
  insertions: Statement[];
  deletions: Statement[];
  filesToCreate: FileToCreate[];
}
