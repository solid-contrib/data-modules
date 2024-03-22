import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { solid } from "../namespaces.js";

export class PreferencesQuery {
  constructor(
    private store: IndexedFormula,
    private webIdNode: NamedNode,
    private preferencesDoc: NamedNode,
  ) {}

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
