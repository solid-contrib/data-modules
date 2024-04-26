import { NamedNode, st, sym } from "rdflib";
import { UpdateOperation } from "./index.js";
import { solid } from "../namespaces.js";
import { generateId } from "../generate-id.js";

export function addAddressBookToTypeIndex(
  typeIndexDoc: NamedNode,
  addressBookUri: string,
): UpdateOperation {
  return {
    deletions: [],
    filesToCreate: [],
    insertions: [
      st(
        sym(`${typeIndexDoc.value}#${generateId()}`),
        solid("instance"),
        sym(addressBookUri),
        typeIndexDoc.doc(),
      ),
    ],
    uri: "",
  };
}
