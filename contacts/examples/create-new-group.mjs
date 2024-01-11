import {ContactsModuleRdfLib as ContactsModule} from '../dist/index.js';
import { Fetcher, graph, UpdateManager } from "rdflib";
import { faker } from "@faker-js/faker";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);
const contacts = new ContactsModule({ store, fetcher, updater });

let addressBookUri =
  "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/index.ttl#this";

const groupName = faker.company.name();

const uri = await contacts.createNewGroup({
  addressBookUri,
  groupName,
});
console.log("created group:", groupName, "at", uri);

const result = await contacts.readAddressBook(addressBookUri);
console.log("the updated address book:", result);
