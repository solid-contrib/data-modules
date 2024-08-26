import { IndexedFormula, NamedNode } from "rdflib";
import { Message } from '../../index.js';
import { wf } from '../namespaces.js';

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

    // TODO query actual message
    return messages.map((it) => ({
      uri: it.uri,
      text: "Hello visitor, welcome to my public chat lobby!",
      date: new Date("2024-07-01T17:47:14Z"),
      authorWebId: "http://localhost:3000/alice/profile/card#me",
    }));
  }
}
