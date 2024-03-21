import { ContactsModuleRdfLib } from "./rdflib/ContactsModuleRdfLib.js";

export default ContactsModuleRdfLib;

export interface ContactsModule {
  /**
   * Lists all known address books of the given Solid user
   * @param webId - The WebID of the user whose address books to list
   * @return The URIs of the address books grouped by public (listed) and private (unlisted) instances
   */
  listAddressBooks(webId: string): Promise<AddressBookLists>;

  /**
   * Creates a new address book in the given container
   * @param command
   * @return The URI of the newly created address book
   */
  createAddressBook({
    containerUri,
    name,
  }: CreateAddressBookCommand): Promise<string>;

  /**
   * Fetch the index data of address book identified by the given URI
   * @param uri - The URI of the address book to read
   * @return The address book title and all known people and groups in that address book
   */
  readAddressBook(uri: string): Promise<AddressBook>;

  /**
   * Creates a new contact within a given address book
   * @param command
   * @return The URI of the newly created contact
   */
  createNewContact({
    addressBookUri,
    contact,
  }: CreateNewContactCommand): Promise<string>;

  /**
   * Fetches the given contact and returns available information
   * @param uri - The URI of the contact to read
   * @return FullContact name, email addresses and phone numbers
   */
  readContact(uri: string): Promise<FullContact>;

  /**
   * Creates a new group within a given address book
   * @param command
   * @return The URI of the newly created group
   */
  createNewGroup({
    addressBookUri,
    groupName,
  }: CreateNewGroupCommand): Promise<string>;

  /**
   * Fetches the given group and returns available information
   * @param uri - The URI of the contact to read
   * @return FullGroup name and list of group members
   */
  readGroup(uri: string): Promise<FullGroup>;

  /**
   * Adds an existing contact to an existing group
   * @param command
   */
  addContactToGroup(command: AddContactToGroupCommand): Promise<void>;

  /**
   * Removes an existing contact from an existing group
   * @param command
   */
  removeContactFromGroup(command: RemoveContactFromGroupCommand): Promise<void>;

  /**
   * Adds a new phone number to the given contact
   *
   * @param contactUri - The URI of the contact
   * @param newPhoneNumber - The phone number to add (RFC 3966 telephone-subscriber part format)
   * @return The URI of the newly created phone number resource
   */
  addNewPhoneNumber(
    contactUri: string,
    newPhoneNumber: string,
  ): Promise<string>;

  /**
   * Adds a new email address to the given contact
   *
   * @param contactUri - The URI of the contact
   * @param newEmailAddress - The email address to add
   * @return The URI of the newly created email address resource
   */
  addNewEmailAddress(
    contactUri: string,
    newEmailAddress: string,
  ): Promise<string>;

  /**
   * Removes the given phone number from the given contact
   *
   * @param contactUri - The URI of the contact
   * @param phoneNumberUri - The URI of the phone number resource
   */
  removePhoneNumber(contactUri: string, phoneNumberUri: string): Promise<void>;

  /**
   * Removes the given email address from the given contact
   *
   * @param contactUri - The URI of the contact
   * @param emailAddressUri - The URI of the email address resource
   */
  removeEmailAddress(
    contactUri: string,
    emailAddressUri: string,
  ): Promise<void>;
}

/**
 * Data needed to create a new address book
 */
export interface CreateAddressBookCommand {
  /**
   * The URI of the target container
   */
  containerUri: string;
  /**
   * The human-readable title for the address book
   */
  name: string;
}

/**
 * Data needed to create a new contact within an address book
 */
export interface CreateNewContactCommand {
  /**
   * The URI of an existing address book the new contact should be added to
   */
  addressBookUri: string;
  /**
   * The data of the contact to create
   */
  contact: NewContact;
  /**
   * URIs of existing groups to add the contact to
   */
  groupUris?: string[];
}

/**
 * Data of a new contact to create
 */
export interface NewContact {
  name: string;
  email?: string;
  phoneNumber?: string;
}

/**
 * Index data of an address book
 */
export interface AddressBook {
  uri: string;
  title: string;
  contacts: Contact[];
  groups: Group[];
}

/**
 *
 */
export interface AddressBookLists {
  publicUris: string[];
  privateUris: string[];
}

/**
 * Partial contact data listed when reading an address book or a group
 */
export interface Contact {
  /**
   * The URI identifying the contact
   */
  uri: string;
  /**
   * The human-readable name of the contact
   */
  name: string;
}

/**
 * Extensive contact data returned when reading a contact
 */
export interface FullContact {
  uri: string;
  name: string;
  emails: Email[];
  phoneNumbers: PhoneNumber[];
}

/**
 * E-mail address associated to a contact
 */
export interface Email {
  uri: string;
  value: string;
}

/**
 * Phone number associated to a contact
 */
export interface PhoneNumber {
  uri: string;
  value: string;
}

/**
 * Partial group data listed when reading an address book
 */
export interface Group {
  /**
   * The URI identifying the group
   */
  uri: string;
  /**
   * The human-readable name of the group
   */
  name: string;
}

/**
 * Extensive contact data returned when reading a contact
 */
export interface FullGroup {
  /**
   * The URI identifying the group
   */
  uri: string;
  /**
   * The human-readable name of the group
   */
  name: string;
  /**
   * List of group members
   */
  members: Contact[];
}

/**
 * Data needed to create a new group within an address book
 */
export interface CreateNewGroupCommand {
  /**
   * The URI of an existing address book the new group should be added to
   */
  addressBookUri: string;
  /**
   * The name of the group to create
   */
  groupName: string;
}

/**
 * Data needed to add an existing contact to an existing group
 */
export interface AddContactToGroupCommand {
  /**
   * The URI of an existing group, to that the contact should be added
   */
  contactUri: string;
  /**
   * The URI of an existing contact, that should be added to the group
   */
  groupUri: string;
}

/**
 * Data needed to remove an existing contact from an existing group
 */
export interface RemoveContactFromGroupCommand {
  /**
   * The URI of an existing group, from that the contact should be removed
   */
  contactUri: string;
  /**
   * The URI of an existing contact, that should be removed to the group
   */
  groupUri: string;
}
