import { IndexedFormula, isNamedNode, NamedNode, sym } from "rdflib";
import { dc, vcard } from "./namespaces";
import { Contact, Group } from "../index";
import { v4 as uuid } from "uuid";

export class AddressBookQuery {
  private addressBookDoc: NamedNode;

  constructor(
    private store: IndexedFormula,
    private addressBookNode: NamedNode,
  ) {
    this.addressBookDoc = addressBookNode.doc();
  }

  proposeNewContactNode(): NamedNode {
    const id = uuid();
    const baseUri = this.addressBookNode.dir()?.uri;
    const personDir = "Person";
    return sym(`${baseUri}${personDir}/${id}/index.ttl#this`);
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

  queryNameEmailIndex(): NamedNode | null {
    const index = this.store.any(
      this.addressBookNode,
      vcard("nameEmailIndex"),
      undefined,
      this.addressBookDoc,
    );
    if (isNamedNode(index)) {
      return index as NamedNode;
    } else {
      return null;
    }
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
