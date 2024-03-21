import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { solid } from "../namespaces.js";

export class ProfileQuery {
  constructor(
    private profileNode: NamedNode,
    private store: IndexedFormula,
  ) {}

  queryPublicTypeIndex(): NamedNode | null {
    const node = this.store.any(
      this.profileNode,
      solid("publicTypeIndex"),
      null,
      this.profileNode.doc(),
    );
    if (isNamedNode(node)) {
      return node as NamedNode;
    }
    return null;
  }
}
