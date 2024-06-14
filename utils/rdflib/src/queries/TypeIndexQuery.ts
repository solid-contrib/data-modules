import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { solid } from "../namespaces/index.js";

export class TypeIndexQuery {
  constructor(
    private store: IndexedFormula,
    public typeIndexDoc: NamedNode,
  ) {}

  queryInstancesForClass(type: NamedNode) {
    const registrations = this.store.each(
      null,
      solid("forClass"),
      type,
      this.typeIndexDoc,
    );
    return registrations.flatMap((registration) => {
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
