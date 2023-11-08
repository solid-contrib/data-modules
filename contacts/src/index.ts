import {
  Fetcher,
  graph,
  IndexedFormula,
  isNamedNode,
  NamedNode,
  sym,
  Node,
} from "rdflib";
import { dc, vcard } from "./namespaces";

interface ModuleConfig {
  fetch: typeof global.fetch;
}

export class ContactsModule {
  private fetcher: Fetcher;
  private store: IndexedFormula;

  constructor(config: ModuleConfig) {
    this.store = graph();
    this.fetcher = new Fetcher(this.store, { fetch: config.fetch });
  }

  async readAddressBook(uri: string): Promise<AddressBook> {
    let addressBookNode = sym(uri);
    await this.fetchNode(addressBookNode);

    const { title, nameEmailIndex } = this.queryAddressBook(addressBookNode);
    await this.fetchNode(nameEmailIndex);

    const contacts = this.queryContacts(nameEmailIndex, addressBookNode);
    return {
      uri,
      title,
      contacts,
      groups: [],
    };
  }

  private async fetchNode(node: Node | null) {
    if (node) {
      await this.fetcher.load(node.value);
    }
  }

  private queryAddressBook(addressBookNode: NamedNode) {
    let addressBookDoc = addressBookNode.doc();
    const title =
      this.store.anyValue(
        addressBookNode,
        dc("title"),
        undefined,
        addressBookDoc,
      ) ?? "";

    const nameEmailIndex = this.store.any(
      addressBookNode,
      vcard("nameEmailIndex"),
      undefined,
      addressBookDoc,
    );
    return {
      title,
      nameEmailIndex,
    };
  }

  private queryContacts(
    nameEmailIndex: Node | null,
    addressBookNode: NamedNode,
  ): Contact[] {
    return nameEmailIndex && isNamedNode(nameEmailIndex)
      ? this.store
          .each(null, vcard("inAddressBook"), addressBookNode, nameEmailIndex)
          .filter((it): it is NamedNode => isNamedNode(it))
          .map((node) => ({
            name:
              this.store.anyValue(node, vcard("fn"), null, nameEmailIndex) ??
              "",
            uri: node.value,
          }))
      : [];
  }
}

export interface AddressBook {
  uri: string;
  title: string;
  contacts: Contact[];
  groups: Group[];
}

export interface Contact {
  uri: string;
  name: string;
}

export interface Group {}
