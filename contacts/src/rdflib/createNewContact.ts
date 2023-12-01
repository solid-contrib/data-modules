import { UpdateOperation } from "./web-operations/executeUpdate";
import { AddressBookQuery } from "./AddressBookQuery";
import { lit, st } from "rdflib";
import { rdf, vcard } from "./namespaces";

export interface Contact {
  name: string;
  email?: string;
  phoneNumber?: string;
}

export function createNewContact(
  addressBook: AddressBookQuery,
  newContact: Contact,
): UpdateOperation {
  const contactNode = addressBook.proposeNewContactNode();
  const nameEmailIndex = addressBook.queryNameEmailIndex();
  if (!nameEmailIndex) {
    throw new Error("name-email index is missing or invalid");
  }
  return {
    uri: contactNode.uri,
    deletions: [],
    insertions: [
      st(contactNode, vcard("fn"), lit(newContact.name), nameEmailIndex),
      st(contactNode, vcard("fn"), lit(newContact.name), contactNode.doc()),
      st(contactNode, rdf("type"), vcard("Individual"), contactNode.doc()),
    ],
    filesToCreate: [],
  };
}
