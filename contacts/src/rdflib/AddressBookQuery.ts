import { IndexedFormula, isNamedNode, NamedNode } from "rdflib";
import { dc, vcard } from "./namespaces";
import { Contact, Group } from "../index";

export class AddressBookQuery {
  private addressBookDoc: NamedNode;

  constructor(
    private store: IndexedFormula,
    private addressBookNode: NamedNode,
  ) {
    this.addressBookDoc = addressBookNode.doc();
  }

  queryTitle() {
    return (
      this.store.anyValue(
        this.addressBookNode,
        dc("title"),
        undefined,
        this.addressBookDoc,
      ) ?? ""
    );
  }

  queryNameEmailIndex() {
    return this.store.any(
      this.addressBookNode,
      vcard("nameEmailIndex"),
      undefined,
      this.addressBookDoc,
    );
  }

  queryContacts(): Contact[] {
    const nameEmailIndex = this.queryNameEmailIndex();
    return nameEmailIndex && isNamedNode(nameEmailIndex)
      ? this.store
          .each(
            null,
            vcard("inAddressBook"),
            this.addressBookNode,
            nameEmailIndex,
          )
          .filter((it): it is NamedNode => isNamedNode(it))
          .map((node) => ({
            name:
              this.store.anyValue(node, vcard("fn"), null, nameEmailIndex) ??
              "",
            uri: node.value,
          }))
      : [];
  }

  queryGroupIndex() {
    return this.store.any(
      this.addressBookNode,
      vcard("groupIndex"),
      undefined,
      this.addressBookDoc,
    );
  }

  queryGroups(): Group[] {
    const groupIndex = this.queryGroupIndex(); //?
    return groupIndex && isNamedNode(groupIndex)
      ? this.store
          .each(this.addressBookNode, vcard("includesGroup"), null, groupIndex)
          .filter((it): it is NamedNode => isNamedNode(it))
          .map((node) => ({
            name:
              this.store.anyValue(node, vcard("fn"), null, groupIndex) ?? "",
            uri: node.value,
          }))
      : [];
  }
}
