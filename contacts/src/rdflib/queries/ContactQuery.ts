import { IndexedFormula, isNamedNode, NamedNode, Node, sym } from "rdflib";
import { vcard } from "../namespaces";
import { Email, PhoneNumber } from "../../index";
import { Namespace } from "rdflib/lib/factories/factory-types";

const MAILTO_URI_SCHEME = "mailto:";
const TEl_URI_SCHEME = "tel:";

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
    const uris = this.getValuesOf(vcard("hasEmail"));

    if (uris.length === 0) {
      return [];
    }

    return uris
      .map((uri) => {
        const valueNode = this.getValueNode(uri);
        if (isMailtoNode(valueNode)) {
          return {
            uri,
            value: valueNode.value.split(MAILTO_URI_SCHEME)[1],
          };
        }
      })
      .filter((value: Email | undefined): value is Email => !!value);
  }

  queryPhoneNumbers(): PhoneNumber[] {
    const uris = this.getValuesOf(vcard("hasTelephone"));
    if (uris.length === 0) {
      return [];
    }
    return uris
      .map((uri) => {
        const valueNode = this.getValueNode(uri);
        if (isTelNode(valueNode)) {
          return {
            uri,
            value: valueNode.value.split(TEl_URI_SCHEME)[1],
          };
        }
      })
      .filter(
        (value: PhoneNumber | undefined): value is PhoneNumber => !!value,
      );
  }

  private getValuesOf(predicate: ReturnType<Namespace>) {
    return this.store
      .statementsMatching(
        this.contactNode,
        predicate,
        undefined,
        this.contactDoc,
      )
      .map((it) => it.object.value);
  }

  private getValueNode(uri: string) {
    return this.store.any(sym(uri), vcard("value"), undefined, this.contactDoc);
  }
}

function isMailtoNode(valueNode: Node | null): valueNode is NamedNode {
  return (
    isNamedNode(valueNode) && valueNode.value.startsWith(MAILTO_URI_SCHEME)
  );
}

function isTelNode(valueNode: Node | null): valueNode is NamedNode {
  return isNamedNode(valueNode) && valueNode.value.startsWith(TEl_URI_SCHEME);
}
