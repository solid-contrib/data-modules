import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { ldp } from "../namespaces/index.js";

/**
 * Used query data from a LDP container
 */
export class ContainerQuery {
  constructor(
    private containerNode: NamedNode,
    private store: IndexedFormula,
  ) {}

  /**
   * Get a list of documents that this container contains
   */
  queryContents(): NamedNode[] {
    return this.store
      .each(this.containerNode, ldp("contains"), null, this.containerNode)
      .filter((it) => isNamedNode(it))
      .map((it) => it as NamedNode);
  }
}
