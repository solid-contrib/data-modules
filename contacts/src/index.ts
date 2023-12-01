export interface ContactsModule {
  readAddressBook(uri: string): Promise<AddressBook>;
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

export interface NewContact {
  name: string;
  email?: string;
  phoneNumber?: string;
}
