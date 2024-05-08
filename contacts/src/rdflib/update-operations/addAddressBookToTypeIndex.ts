import { NamedNode, st, sym } from "rdflib";
import { UpdateOperation } from "./index.js";
import { rdf, solid, vcard } from "../namespaces.js";
import { generateId } from "../generate-id.js";

export function addAddressBookToTypeIndex(
  typeIndexDoc: NamedNode,
  addressBookUri: string,
): UpdateOperation {
  const registrationNode = sym(`${typeIndexDoc.value}#${generateId()}`);
  return {
    deletions: [],
    filesToCreate: [],
    insertions: [
      st(
        registrationNode,
        rdf("type"),
        solid("TypeRegistration"),
        typeIndexDoc,
      ),
      st(
        registrationNode,
        solid("forClass"),
        vcard("AddressBook"),
        typeIndexDoc,
      ),
      st(
        registrationNode,
        solid("instance"),
        sym(addressBookUri),
        typeIndexDoc,
      ),
    ],
    uri: "",
  };
}
