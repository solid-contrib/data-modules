import { AddressBookQuery } from "../queries/AddressBookQuery.js";
import { lit, st, sym } from "rdflib";
import { vcard } from "../namespaces.js";

import { NewContact } from "../../index.js";
import { rdf, UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function createNewContact(
  addressBook: AddressBookQuery,
  newContact: NewContact,
): UpdateOperation & { uri: string } {
  const contactNode = addressBook.proposeNewContactNode();
  const nameEmailIndex = addressBook.queryNameEmailIndex();
  if (!nameEmailIndex) {
    throw new Error("name-email index is missing or invalid");
  }
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
    const emailNode = sym(contactNode.doc().uri + "#email");

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
  if (newContact.phoneNumber) {
    const phoneNode = sym(contactNode.doc().uri + "#phone");
    insertions.push(
      st(contactNode, vcard("hasTelephone"), phoneNode, contactNode.doc()),
      st(
        phoneNode,
        vcard("value"),
        sym("tel:" + newContact.phoneNumber),
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
