import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { solid } from "../namespaces.js";

export class ProfileQuery {
  constructor(
    private profileNode: NamedNode,
    private store: IndexedFormula,
  ) {}

  queryPublicTypeIndex(): NamedNode | null {
    return this.queryNamedNode("publicTypeIndex");
  }

  queryPreferencesFile() {
    return this.queryNamedNode("preferencesFile");
  }

  private queryNamedNode(predicate: string) {
    const node = this.store.any(
      this.profileNode,
      solid(predicate),
      null,
      this.profileNode.doc(),
    );
    if (isNamedNode(node)) {
      return node as NamedNode;
    }
    return null;
  }
}
