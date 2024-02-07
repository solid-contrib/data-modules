import { Fetcher, IndexedFormula, Node, sym, UpdateManager } from "rdflib";
import {
  AddContactToGroupCommand,
  AddressBook,
  ContactsModule,
  CreateAddressBookCommand,
  CreateNewContactCommand,
  CreateNewGroupCommand,
  FullContact,
  FullGroup,
  RemoveContactFromGroupCommand,
} from "..";
import { AddressBookQuery, ContactQuery } from "./queries";
import { createAddressBook, createNewContact } from "./update-operations";
import { executeUpdate } from "./web-operations/executeUpdate";
import { fetchNode } from "./web-operations/fetchNode";
import { createNewGroup } from "./update-operations/createNewGroup";
import { GroupQuery } from "./queries/GroupQuery";
import { addContactToGroup } from "./update-operations/addContactToGroup";
import { removeContactFromGroup } from "./update-operations/removeContactFromGroup";

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

    await this.fetchAll([nameEmailIndex, groupIndex]);

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

  private async fetchAll(nodes: (Node | null)[]) {
    return Promise.all(nodes.map((it) => this.fetchNode(it)));
  }

  async createAddressBook({ containerUri, name }: CreateAddressBookCommand) {
    const operation = createAddressBook(containerUri, name);
    await executeUpdate(this.fetcher, this.updater, operation);
    return operation.uri;
  }

  async createNewContact({
    addressBookUri,
    contact,
    groupUris,
  }: CreateNewContactCommand) {
    const addressBookNode = sym(addressBookUri);
    await this.fetchNode(addressBookNode);
    const operation = createNewContact(
      new AddressBookQuery(this.store, addressBookNode),
      contact,
    );
    await executeUpdate(this.fetcher, this.updater, operation);

    const contactQuery = new ContactQuery(this.store, sym(operation.uri));
    const groupNodes = (groupUris ?? []).map((it) => sym(it));
    await this.fetchAll(groupNodes);

    const groupUpdates = groupNodes.map((groupNode) => {
      const groupQuery = new GroupQuery(this.store, groupNode);

      const operation = addContactToGroup(contactQuery, groupQuery);
      return executeUpdate(this.fetcher, this.updater, operation);
    });

    await Promise.allSettled(groupUpdates);

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

  async readGroup(uri: string): Promise<FullGroup> {
    const groupNode = sym(uri);
    await this.fetchNode(groupNode);
    const query = new GroupQuery(this.store, groupNode);
    const name = query.queryName();
    const members = query.queryMembers();
    return {
      uri,
      name,
      members,
    };
  }

  async addContactToGroup({ contactUri, groupUri }: AddContactToGroupCommand) {
    const contactNode = sym(contactUri);
    const groupNode = sym(groupUri);
    await this.fetchNode(contactNode);
    const contactQuery = new ContactQuery(this.store, contactNode);
    const groupQuery = new GroupQuery(this.store, groupNode);
    const operation = addContactToGroup(contactQuery, groupQuery);
    await executeUpdate(this.fetcher, this.updater, operation);
  }

  async removeContactFromGroup({
    contactUri,
    groupUri,
  }: RemoveContactFromGroupCommand) {
    const contactNode = sym(contactUri);
    const groupNode = sym(groupUri);
    await this.fetchNode(groupNode);
    const contactQuery = new ContactQuery(this.store, contactNode);
    const groupQuery = new GroupQuery(this.store, groupNode);
    const operation = removeContactFromGroup(contactQuery, groupQuery);
    await executeUpdate(this.fetcher, this.updater, operation);
  }
}
