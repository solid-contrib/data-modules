import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { solid, vcard } from "../namespaces.js";

export class TypeIndexQuery {
  constructor(
    private store: IndexedFormula,
    private typeIndexDoc: NamedNode,
  ) {}

  queryAddressBookInstances() {
    const addressBookRegistrations = this.store.each(
      null,
      solid("forClass"),
      vcard("AddressBook"),
      this.typeIndexDoc,
    );
    return addressBookRegistrations.flatMap((registration) => {
      if (!isNamedNode(registration)) return [];
      return this.getInstanceValues(registration as NamedNode);
    });
  }

  private getInstanceValues(registration: NamedNode) {
    return this.store
      .each(registration, solid("instance"), null, this.typeIndexDoc)
      .map((it) => it.value);
  }
}
