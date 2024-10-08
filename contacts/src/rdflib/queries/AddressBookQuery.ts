import { IndexedFormula, isNamedNode, NamedNode, sym } from "rdflib";
import { dc, vcard } from "../namespaces.js";
import { Contact, Group } from "../../index.js";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";

export class AddressBookQuery {
  private addressBookDoc: NamedNode;

  constructor(
    private store: IndexedFormula,
    public addressBookNode: NamedNode,
  ) {
    this.addressBookDoc = addressBookNode.doc();
  }

  proposeNewContactNode(): NamedNode {
    return this.proposeNewNode("Person");
  }

  proposeNewGroupNode(): NamedNode {
    return this.proposeNewNode("Group");
  }

  private proposeNewNode(containerPath: string) {
    const id = generateId();
    const baseUri = this.addressBookNode.dir()?.uri;
    return sym(`${baseUri}${containerPath}/${id}/index.ttl#this`);
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

  queryGroupIndex(): NamedNode | null {
    const index = this.store.any(
      this.addressBookNode,
      vcard("groupIndex"),
      undefined,
      this.addressBookDoc,
    );
    if (isNamedNode(index)) {
      return index as NamedNode;
    } else {
      return null;
    }
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
