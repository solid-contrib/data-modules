import { IndexedFormula, NamedNode } from "rdflib";
import { Message } from "../../index.js";
import { wf } from "../namespaces.js";
import { MessageQuery } from "./MessageQuery.js";

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

    return messages
      .map((messageNode) =>
        new MessageQuery(messageNode, this.store).queryMessage(),
      )
      .filter((it) => it !== null);
  }
}
