import { IndexedFormula, NamedNode } from "rdflib";
import { vcard } from "../namespaces";

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
}
