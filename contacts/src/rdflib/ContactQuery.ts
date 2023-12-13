import { IndexedFormula, NamedNode, sym } from "rdflib";
import { vcard } from "./namespaces";
import { Email } from "../index";

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
    const uri = this.store.anyValue(
      this.contactNode,
      vcard("hasEmail"),
      undefined,
      this.contactDoc,
    );
    if (!uri) {
      return [];
    }
    const value: string =
      this.store.anyValue(
        sym(uri),
        vcard("value"),
        undefined,
        this.contactDoc,
      ) ?? "";

    if (!value) {
      return [];
    }

    return [
      {
        uri,
        value: value.split("mailto:")[1],
      },
    ];
  }
}
