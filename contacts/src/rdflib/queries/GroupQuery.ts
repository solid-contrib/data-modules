import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { vcard } from "../namespaces.js";

export class GroupQuery {
  private groupDoc: NamedNode;

  constructor(
    private store: IndexedFormula,
    public groupNode: NamedNode,
  ) {
    this.groupDoc = groupNode.doc();
  }
  queryName(): string {
    return (
      this.store.anyValue(
        this.groupNode,
        vcard("fn"),
        undefined,
        this.groupDoc,
      ) ?? ""
    );
  }

  queryMembers() {
    return this.store
      .each(this.groupNode, vcard("hasMember"), null, this.groupDoc)
      .filter((it): it is NamedNode => isNamedNode(it))
      .map((node) => ({
        uri: node.value,
        name: this.store.anyValue(node, vcard("fn"), null, this.groupDoc) ?? "",
      }));
  }
}
