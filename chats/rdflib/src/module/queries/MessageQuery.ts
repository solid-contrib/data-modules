import { IndexedFormula, NamedNode, sym } from "rdflib";
import { Message } from "../../index.js";

export class MessageQuery {
  constructor(
    private messageNode: NamedNode,
    private store: IndexedFormula,
  ) {}

  queryMessage(): Message | null {
    const text = this.store.anyValue(
      this.messageNode,
      sym("http://rdfs.org/sioc/ns#content"),
    );

    if (!text) {
      return null;
    }

    const date = this.store.anyJS(
      this.messageNode,
      sym("http://purl.org/dc/terms/created"),
    );
    if (!date) return null;
    const authorWebId = this.store.anyValue(
      this.messageNode,
      sym("http://xmlns.com/foaf/0.1/maker"),
    );
    if (!authorWebId) {
      return null;
    }
    return {
      uri: this.messageNode.uri,
      text,
      date,
      authorWebId,
    };
  }
}
