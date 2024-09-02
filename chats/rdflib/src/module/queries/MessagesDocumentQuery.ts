import { IndexedFormula, NamedNode, sym } from "rdflib";
import { Message } from "../../index.js";
import { wf } from "../namespaces.js";

export class MessagesDocumentQuery {
  constructor(
    private chatNode: NamedNode,
    private messagesDocument: NamedNode,
    private store: IndexedFormula,
  ) {}

  queryMessages(): Message[] {
    const messages: NamedNode[] = this.store
      .each(this.chatNode, wf("message"), undefined, this.messagesDocument)
      .map((it) => it as NamedNode);

    return messages.map((messageNode) => this.queryMessage(messageNode));
  }

  private queryMessage(messageNode: NamedNode) {
    const text =
      this.store.anyValue(
        messageNode,
        sym("http://rdfs.org/sioc/ns#content"),
      ) ?? "";

    const date = this.store.anyJS(
      messageNode,
      sym("http://purl.org/dc/terms/created"),
    );
    const authorWebId =
      this.store.anyValue(
        messageNode,
        sym("http://xmlns.com/foaf/0.1/maker"),
      ) ?? "";
    return {
      uri: messageNode.uri,
      text,
      date,
      authorWebId,
    };
  }
}
