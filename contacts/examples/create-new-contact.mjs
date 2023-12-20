import { ContactsModule } from "../dist/rdflib/index.js";
import { Fetcher, graph, UpdateManager } from "rdflib";
import { faker } from "@faker-js/faker";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);
const contacts = new ContactsModule({ store, fetcher, updater });

let addressBookUri =
  "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/index.ttl#this";

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
});
console.log("created contact:", contact, "at", uri);

const result = await contacts.readAddressBook(addressBookUri);
console.log("the updated address book:", result);
