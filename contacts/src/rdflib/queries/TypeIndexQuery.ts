import { IndexedFormula, isNamedNode, NamedNode, Node } from "rdflib";
import { solid, vcard } from "../namespaces.js";

export class TypeIndexQuery {
  constructor(
    private store: IndexedFormula,
    private typeIndexDoc: NamedNode,
  ) {}

  queryAddressBookInstances() {
    const addressBookRegistration = this.store.any(
      null,
      solid("forClass"),
      vcard("AddressBook"),
      this.typeIndexDoc,
    );

    if (!isNamedNode(addressBookRegistration)) return [];

    const instance = this.store.each(
      addressBookRegistration,
      solid("instance"),
      null,
      this.typeIndexDoc,
    );
    return instance.map((it) => it.value);
  }
}
