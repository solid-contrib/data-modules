import {ContactsModuleRdfLib as ContactsModule} from '../dist/index.js';
import { Fetcher, graph, UpdateManager } from "rdflib";
import { faker } from "@faker-js/faker";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);
const contacts = new ContactsModule({ store, fetcher, updater });

let addressBookUri =
  "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/index.ttl#this";

const firstGroupUri = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/Group/41faaf6f-37c3-437a-900d-e6a0e6c92463/index.ttl#this";
const secondGroupUri = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/Group/893dba2a-2bc7-49d6-a4d2-7b89d88874ca/index.ttl#this";

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const contact = {
  name: firstName + " " + lastName,
  email: faker.internet.email({ firstName, lastName }),
  phoneNumber: faker.helpers.fromRegExp(
    /[0-9]{2,4}-[0-9]{2,4}-[0-9]{2,4}-[0-9]{2,4}/,
  ),
};
const uri = await contacts.createNewContact({
  addressBookUri,
  contact,
  groupUris: [
    firstGroupUri,
    secondGroupUri
  ]
});
console.log("created contact:", contact, "at", uri);

const result = await contacts.readAddressBook(addressBookUri);
console.log("the updated address book:", result);

const firstGroupResult = await contacts.readGroup(firstGroupUri);
console.log("the first updated group:", firstGroupResult);

const secondGroupResult = await contacts.readGroup(secondGroupUri);
console.log("the second updated group:", secondGroupResult);
