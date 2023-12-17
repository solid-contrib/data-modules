import { IndexedFormula, isNamedNode, NamedNode, Node, sym } from "rdflib";
import { vcard } from "./namespaces";
import { Email } from "../index";

const MAILTO_URI_SCHEME = "mailto:";

export class ContactQuery {
  private contactDoc: NamedNode;

  constructor(
    private store: IndexedFormula,
    public contactNode: NamedNode,
  ) {
    this.contactDoc = contactNode.doc();
  }
  queryName(): string {
    return (
      this.store.anyValue(
        this.contactNode,
        vcard("fn"),
        undefined,
        this.contactDoc,
      ) ?? ""
    );
  }

  queryEmails(): Email[] {
    const uris = this.store
      .statementsMatching(
        this.contactNode,
        vcard("hasEmail"),
        undefined,
        this.contactDoc,
      )
      .map((it) => it.object.value);

    if (uris.length === 0) {
      return [];
    }

    return uris
      .map((uri) => {
        const valueNode = this.store.any(
          sym(uri),
          vcard("value"),
          undefined,
          this.contactDoc,
        );
        if (isMailtoNode(valueNode)) {
          return {
            uri,
            value: valueNode.value.split(MAILTO_URI_SCHEME)[1],
          };
        }
      })
      .filter((value: Email | undefined): value is Email => !!value);
  }
}

function isMailtoNode(valueNode: Node | null): valueNode is NamedNode {
  return (
    isNamedNode(valueNode) && valueNode.value.startsWith(MAILTO_URI_SCHEME)
  );
}
