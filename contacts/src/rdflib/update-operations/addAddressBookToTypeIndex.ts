import { NamedNode, st, sym } from "rdflib";
import { UpdateOperation } from "./index.js";
import { solid } from "../namespaces.js";

export function addAddressBookToTypeIndex(
  typeIndexDoc: NamedNode,
  addressBookUri: string,
): UpdateOperation {
  return {
    deletions: [],
    filesToCreate: [],
    insertions: [
      st(
        sym(typeIndexDoc.value + "#registration"),
        solid("instance"),
        sym(addressBookUri),
        typeIndexDoc.doc(),
      ),
    ],
    uri: "",
  };
}
