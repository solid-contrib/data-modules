import { Fetcher, IndexedFormula, Node, sym, UpdateManager } from "rdflib";
import {
  AddressBook,
  ContactsModule,
  CreateAddressBookCommand,
  CreateNewContactCommand,
  CreateNewGroupCommand,
  FullContact,
} from "..";
import { AddressBookQuery, ContactQuery } from "./queries";
import { createAddressBook, createNewContact } from "./update-operations";
import { executeUpdate } from "./web-operations/executeUpdate";
import { fetchNode } from "./web-operations/fetchNode";
import { createNewGroup } from "./update-operations/createNewGroup";

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

  async createAddressBook({ containerUri, name }: CreateAddressBookCommand) {
    const operation = createAddressBook(containerUri, name);
    await executeUpdate(this.fetcher, this.updater, operation);
    return operation.uri;
  }

  async createNewContact({ addressBookUri, contact }: CreateNewContactCommand) {
    const addressBookNode = sym(addressBookUri);
    await this.fetchNode(addressBookNode);
    const operation = createNewContact(
      new AddressBookQuery(this.store, addressBookNode),
      contact,
    );
    await executeUpdate(this.fetcher, this.updater, operation);
    return operation.uri;
  }

  async readContact(uri: string): Promise<FullContact> {
    const contactNode = sym(uri);
    await this.fetchNode(contactNode);
    const query = new ContactQuery(this.store, contactNode);
    const name = query.queryName();
    const emails = query.queryEmails();
    const phoneNumbers = query.queryPhoneNumbers();
    return {
      uri,
      name,
      emails,
      phoneNumbers,
    };
  }

  async createNewGroup({ addressBookUri, groupName }: CreateNewGroupCommand) {
    const addressBookNode = sym(addressBookUri);
    await this.fetchNode(addressBookNode);

    const query = new AddressBookQuery(this.store, addressBookNode);
    const operation = createNewGroup(query, groupName);
    await executeUpdate(this.fetcher, this.updater, operation);
    return operation.uri;
  }
}
