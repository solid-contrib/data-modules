import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { pim, solid } from "../namespaces/index.js";

/**
 * Used query data from a user's profile document
 */
export class ProfileQuery {
  constructor(
    /**
     * The WebID of the user
     */
    private webIdNode: NamedNode,
    private store: IndexedFormula,
  ) {}

  /**
   * Look up the public type index. Returns null if none is found or if the predicated does not link to a proper named node
   */
  queryPublicTypeIndex(): NamedNode | null {
    const predicate = solid("publicTypeIndex") as NamedNode;
    return this.queryNamedNode(predicate);
  }

  /**
   * Look up the preferences file. Returns null if none is found or if the predicated does not link to a proper named node
   */
  queryPreferencesFile() {
    const predicate = pim("preferencesFile") as NamedNode;
    return this.queryNamedNode(predicate);
  }

  private queryNamedNode(predicate: NamedNode) {
    const node = this.store.any(
      this.webIdNode,
      predicate,
      null,
      this.webIdNode.doc(),
    );
    if (isNamedNode(node)) {
      return node as NamedNode;
    }
    return null;
  }
}
