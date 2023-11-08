import { Fetcher, graph, IndexedFormula, sym } from "rdflib";

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
    const title =
      this.store.anyValue(
        sym(uri),
        sym("http://purl.org/dc/elements/1.1/title"),
        undefined,
        sym(uri).doc(),
      ) ?? "";
    return {
      uri,
      title,
      contacts: [],
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
