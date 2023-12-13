import { IndexedFormula, isNamedNode, NamedNode, sym } from "rdflib";
import { dc, vcard } from "./namespaces";
import { Contact, Group } from "../index";
import { v4 as uuid } from "uuid";

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
}
