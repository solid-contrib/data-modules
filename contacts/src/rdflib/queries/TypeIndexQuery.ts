import { IndexedFormula, isNamedNode, NamedNode, Node } from "rdflib";
import { rdf, solid, vcard } from "../namespaces.js";

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

    if (!this.isValidTypeRegistration(addressBookRegistration)) return [];

    const instance = this.store.each(
      addressBookRegistration,
      solid("instance"),
      null,
      this.typeIndexDoc,
    );
    return instance.map((it) => it.value);
  }

  private isValidTypeRegistration(
    addressBookRegistration: Node | null,
  ): addressBookRegistration is NamedNode {
    const isTypeRegistration = this.store.holds(
      addressBookRegistration,
      rdf("type"),
      solid("TypeRegistration"),
      this.typeIndexDoc,
    );
    return (
      addressBookRegistration !== null &&
      isNamedNode(addressBookRegistration) &&
      isTypeRegistration
    );
  }
}
