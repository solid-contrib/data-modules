import {
  Fetcher,
  graph,
  IndexedFormula,
  Node,
  sym,
  UpdateManager,
} from "rdflib";
import { AddressBook, ContactsModule, ModuleConfig } from "..";
import { AddressBookQuery } from "./AddressBookQuery";
import { createAddressBook } from "./createAddressBook";

interface CreateAddressBookCommand {
  container: string;
  name: string;
}

export class ContactsModuleRdfLib implements ContactsModule {
  private fetcher: Fetcher;
  private store: IndexedFormula;
  private updater: UpdateManager;

  constructor(config: ModuleConfig) {
    this.store = graph();
    this.fetcher = new Fetcher(this.store, { fetch: config.fetch });
    this.updater = new UpdateManager(this.store);
  }

  async readAddressBook(uri: string): Promise<AddressBook> {
    const addressBookNode = sym(uri);
    await this.fetchNode(addressBookNode);

    const query = new AddressBookQuery(this.store, addressBookNode);
    const title = query.queryTitle();
    const nameEmailIndex = query.queryNameEmailIndex();
    const groupIndex = query.queryGroupIndex();

    await Promise.allSettled([
      this.fetchNode(nameEmailIndex),
      this.fetchNode(groupIndex),
    ]);

    const contacts = query.queryContacts();
    const groups = query.queryGroups();
    return {
      uri,
      title,
      contacts,
      groups,
    };
  }

  private async fetchNode(node: Node | null) {
    if (node) {
      await this.fetcher.load(node.value);
    }
  }

  async createAddressBook({ container, name }: CreateAddressBookCommand) {
    const operation = createAddressBook(container, name);
    await this.updater.update(operation.deletions, operation.insertions);
    operation.filesToCreate.map((file) => {
      this.createEmptyTurtleFile(file.uri);
    });
    return operation.uri;
  }

  private async createEmptyTurtleFile(uri: string) {
    await this.fetcher.webOperation("PUT", uri, {
      contentType: "text/turtle",
    });
  }
}
