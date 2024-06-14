import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { solid } from "../namespaces/index.js";

/**
 * Used query data from a type index document
 */
export class TypeIndexQuery {
  constructor(
    private store: IndexedFormula,
    public typeIndexDoc: NamedNode,
  ) {}

  /**
   * Look up the instances in the type registration for the given RDF class
   * @param type - The RDF class to look up
   * @returns A list of the URIs of the found instances
   */
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
