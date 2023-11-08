import {
  Fetcher,
  graph,
  IndexedFormula,
  isNamedNode,
  NamedNode,
  sym,
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
    await this.fetcher.load(uri);
    let addressBookNode = sym(uri);
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
    if (nameEmailIndex) {
      await this.fetcher.load(nameEmailIndex.value);
    }
    const contacts =
      nameEmailIndex && isNamedNode(nameEmailIndex)
        ? this.store
            .each(null, vcard("inAddressBook"), addressBookNode, nameEmailIndex)
            .filter((it): it is NamedNode => isNamedNode(it))
            .map((node) => ({
              name: this.store.anyValue(
                node,
                vcard("fn"),
                null,
                nameEmailIndex,
              ),
              uri: node.value,
            }))
        : [];
    return {
      uri,
      title,
      contacts,
      groups: [],
    };
  }
}

export interface AddressBook {
  uri: string;
  title: string;
  contacts: Contact[];
  groups: Group[];
}

export interface Contact {}

export interface Group {}
