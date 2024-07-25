import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { solid } from "../namespaces/index.js";
import { TypeRegistrations } from "../index";

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
    return this.queryRegistrationsForType(type).instances;
  }

  private getNamedNodes(
    which: "instance" | "instanceContainer",
    registration: NamedNode,
  ): NamedNode[] {
    return this.store
      .each(registration, solid(which), null, this.typeIndexDoc)
      .filter((it) => isNamedNode(it))
      .map((it) => it as NamedNode);
  }

  queryRegistrationsForType(type: NamedNode): TypeRegistrations {
    const registrations = this.store.each(
      null,
      solid("forClass"),
      type,
      this.typeIndexDoc,
    );
    return registrations
      .filter((it) => isNamedNode(it))
      .map((it) => it as NamedNode)
      .map((registration: NamedNode) => {
        return {
          instances: this.getNamedNodes("instance", registration),
          instanceContainers: this.getNamedNodes(
            "instanceContainer",
            registration,
          ),
        };
      })
      .reduce(
        (acc, current) => ({
          instances: [...acc.instances, ...current.instances],
          instanceContainers: [
            ...acc.instanceContainers,
            ...current.instanceContainers,
          ],
        }),
        { instanceContainers: [], instances: [] },
      );
  }
}
