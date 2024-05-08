import {
  Fetcher,
  IndexedFormula,
  NamedNode,
  Node,
  sym,
  UpdateManager,
} from "rdflib";
import {
  AddContactToGroupCommand,
  AddNewEmailAddressCommand,
  AddNewPhoneNumberCommand,
  AddressBook,
  AddressBookLists,
  ContactsModule,
  CreateAddressBookCommand,
  CreateNewContactCommand,
  CreateNewGroupCommand,
  FullContact,
  FullGroup,
  NewContact,
  RemoveContactFromGroupCommand,
  RemoveEmailAddressCommand,
  RemovePhoneNumberCommand,
  RenameContactCommand,
  UpdatePhoneNumberCommand,
} from "../index.js";
import { AddressBookQuery, ContactQuery } from "./queries/index.js";
import {
  createAddressBook,
  createNewContact,
} from "./update-operations/index.js";
import { executeUpdate } from "./web-operations/executeUpdate.js";
import { fetchNode } from "./web-operations/fetchNode.js";
import { createNewGroup } from "./update-operations/createNewGroup.js";
import { GroupQuery } from "./queries/GroupQuery.js";
import { addContactToGroup } from "./update-operations/addContactToGroup.js";
import { removeContactFromGroup } from "./update-operations/removeContactFromGroup.js";
import { addNewPhoneNumber } from "./update-operations/addNewPhoneNumber.js";
import { addNewEmailAddress } from "./update-operations/addNewEmailAddress.js";
import { removePhoneNumber } from "./update-operations/removePhoneNumber.js";
import { removeEmailAddress } from "./update-operations/removeEmailAddress.js";
import { ProfileQuery } from "./queries/ProfileQuery.js";
import { TypeIndexQuery } from "./queries/TypeIndexQuery.js";
import { PreferencesQuery } from "./queries/PreferencesQuery.js";
import { renameContact } from "./update-operations/renameContact.js";
import { addAddressBookToTypeIndex } from "./update-operations/addAddressBookToTypeIndex.js";
import { updatePhoneNumber } from "./update-operations/updatePhoneNumber.js";

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

  async createAddressBook({
    containerUri,
    name,
    ownerWebId,
  }: CreateAddressBookCommand) {
    const operation = createAddressBook(containerUri, name);
    await executeUpdate(this.fetcher, this.updater, operation);

    if (ownerWebId) {
      await this.updatePrivateTypeIndex(ownerWebId, operation.uri);
    }

    return operation.uri;
  }

  private async updatePrivateTypeIndex(
    ownerWebId: string,
    addressBookUri: string,
  ) {
    const profileNode = sym(ownerWebId);
    await this.fetchNode(profileNode);

    const profileQuery = new ProfileQuery(profileNode, this.store);
    const preferencesFile = profileQuery.queryPreferencesFile();
    const privateTypeIndex = await this.fetchPrivateTypeIndex(
      profileNode,
      preferencesFile,
    );
    if (!privateTypeIndex) {
      throw new Error(`Private type not found for WebID ${ownerWebId}.`);
    }
    const operation = addAddressBookToTypeIndex(
      privateTypeIndex,
      addressBookUri,
    );
    await executeUpdate(this.fetcher, this.updater, operation);
  }

  async createNewContact({
    addressBookUri,
    contact,
    groupUris,
  }: CreateNewContactCommand) {
    const contactQuery = await this.executeCreateNewContact(
      addressBookUri,
      contact,
    );
    await this.executeAddContactToGroups(groupUris, contactQuery);

    return contactQuery.contactNode.uri;
  }

  private async executeAddContactToGroups(
    groupUris: string[] | undefined,
    contactQuery: ContactQuery,
  ) {
    const groupNodes = (groupUris ?? []).map((it) => sym(it));
    await this.fetchAll(groupNodes);

    const groupUpdates = groupNodes.map((groupNode) => {
      const groupQuery = new GroupQuery(this.store, groupNode);

      const operation = addContactToGroup(contactQuery, groupQuery);
      return executeUpdate(this.fetcher, this.updater, operation);
    });

    await Promise.allSettled(groupUpdates);
  }

  private async executeCreateNewContact(
    addressBookUri: string,
    contact: NewContact,
  ) {
    const addressBookNode = sym(addressBookUri);
    await this.fetchNode(addressBookNode);
    const operation = createNewContact(
      new AddressBookQuery(this.store, addressBookNode),
      contact,
    );
    await executeUpdate(this.fetcher, this.updater, operation);

    return new ContactQuery(this.store, sym(operation.uri));
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

  async addNewPhoneNumber({
    contactUri,
    newPhoneNumber,
  }: AddNewPhoneNumberCommand) {
    const contactNode = sym(contactUri);
    const operation = addNewPhoneNumber(contactNode, newPhoneNumber);
    await executeUpdate(this.fetcher, this.updater, operation);
    return operation.uri;
  }

  async addNewEmailAddress({
    contactUri,
    newEmailAddress,
  }: AddNewEmailAddressCommand) {
    const contactNode = sym(contactUri);
    const operation = addNewEmailAddress(contactNode, newEmailAddress);
    await executeUpdate(this.fetcher, this.updater, operation);
    return operation.uri;
  }

  async removePhoneNumber({
    contactUri,
    phoneNumberUri,
  }: RemovePhoneNumberCommand) {
    const contactNode = sym(contactUri);
    const phoneNumberNode = sym(phoneNumberUri);
    await this.fetchNode(phoneNumberNode);
    const operation = removePhoneNumber(
      contactNode,
      phoneNumberNode,
      this.store,
    );
    await executeUpdate(this.fetcher, this.updater, operation);
  }

  async removeEmailAddress({
    contactUri,
    emailAddressUri,
  }: RemoveEmailAddressCommand) {
    const contactNode = sym(contactUri);
    const emailAddressNode = sym(emailAddressUri);
    await this.fetchNode(emailAddressNode);
    const operation = removeEmailAddress(
      contactNode,
      emailAddressNode,
      this.store,
    );
    await executeUpdate(this.fetcher, this.updater, operation);
  }

  async updatePhoneNumber({
    phoneNumberUri,
    newPhoneNumber,
  }: UpdatePhoneNumberCommand) {
    const phoneNumberNode = sym(phoneNumberUri);
    await this.fetchNode(phoneNumberNode);
    const operation = updatePhoneNumber(
      phoneNumberNode,
      newPhoneNumber,
      this.store,
    );
    await executeUpdate(this.fetcher, this.updater, operation);
  }

  async listAddressBooks(webId: string): Promise<AddressBookLists> {
    const profileNode = sym(webId);
    await this.fetchNode(profileNode);

    const profileQuery = new ProfileQuery(profileNode, this.store);
    const publicTypeIndexNode = profileQuery.queryPublicTypeIndex();
    const preferencesFile = profileQuery.queryPreferencesFile();

    const promisePublicUris =
      this.fetchIndexedAddressBooks(publicTypeIndexNode);
    const promisePrivateTypeIndex = this.fetchPrivateTypeIndex(
      profileNode,
      preferencesFile,
    );
    const [publicUris, privateTypeIndex] = await Promise.allSettled([
      promisePublicUris,
      promisePrivateTypeIndex,
    ]);

    const privateUris =
      privateTypeIndex.status === "fulfilled"
        ? await this.fetchIndexedAddressBooks(privateTypeIndex.value)
        : [];

    return {
      publicUris: publicUris.status === "fulfilled" ? publicUris.value : [],
      privateUris,
    };
  }

  private async fetchIndexedAddressBooks(
    publicTypeIndexNode: NamedNode | null,
  ): Promise<string[]> {
    if (!publicTypeIndexNode) {
      return [];
    }
    await this.fetchNode(publicTypeIndexNode);
    return new TypeIndexQuery(
      this.store,
      publicTypeIndexNode,
    ).queryAddressBookInstances();
  }

  private async fetchPrivateTypeIndex(
    profileNode: NamedNode,
    preferencesFile: NamedNode | null,
  ): Promise<NamedNode | null> {
    if (!preferencesFile) {
      return null;
    }
    await this.fetchNode(preferencesFile);
    const preferencesQuery = new PreferencesQuery(
      this.store,
      profileNode,
      preferencesFile,
    );
    return preferencesQuery.queryPrivateTypeIndex();
  }

  async renameContact({ contactUri, newName }: RenameContactCommand) {
    const contactNode = sym(contactUri);
    await this.fetchNode(contactNode);
    const operation = renameContact(this.store, contactNode, newName);
    await executeUpdate(this.fetcher, this.updater, operation);
  }
}
