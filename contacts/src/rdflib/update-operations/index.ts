import { Statement } from "rdflib";

export { createAddressBook } from "./createAddressBook";
export { createNewContact } from "./createNewContact";

export interface FileToCreate {
  uri: string;
}

export interface UpdateOperation {
  uri: string;
  insertions: Statement[];
  deletions: Statement[];
  filesToCreate: FileToCreate[];
}
