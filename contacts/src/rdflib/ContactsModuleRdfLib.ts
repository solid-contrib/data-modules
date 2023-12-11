import { Fetcher, IndexedFormula, Node, sym, UpdateManager } from "rdflib";
import { AddressBook, ContactsModule, NewContact } from "..";
import { AddressBookQuery } from "./AddressBookQuery";
import { createAddressBook } from "./createAddressBook";
import { executeUpdate } from "./web-operations/executeUpdate";
import { createNewContact } from "./createNewContact";
import { fetchNode } from "./web-operations/fetchNode";

interface CreateAddressBookCommand {
  container: string;
  name: string;
}

interface CreateNewContactCommand {
  addressBook: string;
  contact: NewContact;
}

interface ModuleConfig {
  store: IndexedFormula;
  fetcher: Fetcher;
  updater: UpdateManager;
}

export class ContactsModuleRdfLib implements ContactsModule {
  private readonly fetcher: Fetcher;
  private readonly store: IndexedFormula;
  private readonly updater: UpdateManager;

  constructor(config: ModuleConfig) {
    this.store = config.store;
    this.fetcher = config.fetcher;
    this.updater = config.updater;
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
    return fetchNode(this.fetcher, node);
  }

  async createAddressBook({ container, name }: CreateAddressBookCommand) {
    const operation = createAddressBook(container, name);
    await executeUpdate(this.fetcher, this.updater, operation);
    return operation.uri;
  }

  async createNewContact({ addressBook, contact }: CreateNewContactCommand) {
    const addressBookNode = sym(addressBook);
    await this.fetchNode(addressBookNode);
    const operation = createNewContact(
      new AddressBookQuery(this.store, addressBookNode),
      contact,
    );
    await executeUpdate(this.fetcher, this.updater, operation);
    return operation.uri;
  }
}
