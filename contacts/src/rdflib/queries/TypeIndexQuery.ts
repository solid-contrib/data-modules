import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { rdf, solid } from "../namespaces.js";

export class TypeIndexQuery {
  constructor(
    private store: IndexedFormula,
    private typeIndexDoc: NamedNode,
  ) {}

  queryAddressBookInstances() {
    const registration = this.store.any(
      null,
      rdf("type"),
      solid("TypeRegistration"),
    );
    if (!registration || !isNamedNode(registration)) return [];
    const instance = this.store.each(registration, solid("instance"));
    return instance.map((it) => it.value);
  }
}
