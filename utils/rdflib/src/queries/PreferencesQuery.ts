import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { solid } from "../namespaces/index.js";

/**
 * Used query data from a user's preferences file
 */
export class PreferencesQuery {
  constructor(
    private store: IndexedFormula,
    /**
     * The WebID of the user
     */
    private webIdNode: NamedNode,
    /**
     * The preferences file
     */
    private preferencesDoc: NamedNode,
  ) {}

  /**
   * Look up the private type index. Returns null if none is found or if the predicated does not link to a proper named node
   */
  queryPrivateTypeIndex(): NamedNode | null {
    const node = this.store.any(
      this.webIdNode,
      solid("privateTypeIndex"),
      null,
      this.preferencesDoc,
    );
    if (isNamedNode(node)) {
      return node as NamedNode;
    }
    return null;
  }
}
