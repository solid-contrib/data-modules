import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { pim, solid } from "../namespaces/index.js";

export class ProfileQuery {
  constructor(
    private webIdNode: NamedNode,
    private store: IndexedFormula,
  ) {}

  queryPublicTypeIndex(): NamedNode | null {
    const predicate = solid("publicTypeIndex") as NamedNode;
    return this.queryNamedNode(predicate);
  }

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
