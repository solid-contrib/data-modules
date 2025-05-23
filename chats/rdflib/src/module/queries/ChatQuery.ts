import { IndexedFormula, NamedNode } from "rdflib";
import { dc } from "../namespaces.js";

export class ChatQuery {
  constructor(
    private chatNode: NamedNode,
    private store: IndexedFormula,
  ) {}

  queryTitle() {
    const title = this.store.anyValue(
      this.chatNode,
      dc("title"),
      undefined,
      this.chatNode.doc(),
    );
    return title || "";
  }

  queryContainer(): NamedNode {
    const container = this.chatNode.dir();
    if (!container) {
      throw new Error(
        `The chat node ${this.chatNode.uri} has no parent container`,
      );
    }
    return container!;
  }
}
