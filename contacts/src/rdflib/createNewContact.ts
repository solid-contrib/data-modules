import { UpdateOperation } from "./web-operations/executeUpdate";
import { AddressBookQuery } from "./AddressBookQuery";
import { lit, st, sym } from "rdflib";
import { rdf, vcard } from "./namespaces";

import { NewContact } from "../index";

export function createNewContact(
  addressBook: AddressBookQuery,
  newContact: NewContact,
): UpdateOperation {
  const contactNode = addressBook.proposeNewContactNode();
  const nameEmailIndex = addressBook.queryNameEmailIndex();
  if (!nameEmailIndex) {
    throw new Error("name-email index is missing or invalid");
  }
  const emailNode = sym(contactNode.doc().uri + "#email");
  const insertions = [
    st(
      contactNode,
      vcard("inAddressBook"),
      addressBook.addressBookNode,
      nameEmailIndex,
    ),
    st(contactNode, vcard("fn"), lit(newContact.name), nameEmailIndex),
    st(contactNode, vcard("fn"), lit(newContact.name), contactNode.doc()),
    st(contactNode, rdf("type"), vcard("Individual"), contactNode.doc()),
  ];
  if (newContact.email) {
    insertions.push(
      st(contactNode, vcard("hasEmail"), emailNode, contactNode.doc()),
      st(
        emailNode,
        vcard("value"),
        sym("mailto:" + newContact.email),
        contactNode.doc(),
      ),
    );
  }
  return {
    uri: contactNode.uri,
    deletions: [],
    insertions: insertions,
    filesToCreate: [],
  };
}
