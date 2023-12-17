export interface ContactsModule {
  /**
   * Creates a new address book in the given container
   * @param container - The URI of the target container
   * @param name - The human-readable title for the address book
   * @return The URI of the newly created address book
   */
  createAddressBook({
    container,
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
   * @param addressBook - The URI of an existing address book the new contact should be added to
   * @param contact - The data of the contact to create
   * @return The URI of the newly created contact
   */
  createNewContact({
    addressBook,
    contact,
  }: CreateNewContactCommand): Promise<string>;

  /**
   * Fetches the given contact and returns available information
   * @param uri - The URI of the contact to read
   * @return Contact name, email addresses and phone numbers
   */
  readContact(uri: string): Promise<FullContact>;
}

/**
 * Data needed to create a new address book
 */
export interface CreateAddressBookCommand {
  container: string;
  name: string;
}

/**
 * Data needed to create a new contact within an address book
 */
export interface CreateNewContactCommand {
  addressBook: string;
  contact: NewContact;
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
 * Partial contact data listed when reading an address book
 */
export interface Contact {
  uri: string;
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
export interface Group {}
