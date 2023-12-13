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

export interface FullContact {
  uri: string;
  name: string;
  emails: Email[];
}

interface Email {
  uri: string;
  value: string;
}

export interface Group {}

export interface NewContact {
  name: string;
  email?: string;
  phoneNumber?: string;
}
