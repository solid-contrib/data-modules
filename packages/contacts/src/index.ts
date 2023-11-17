export interface ModuleConfig {
  fetch: typeof global.fetch;
}

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
