import ContactsModule from '../dist/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";
import { faker } from "@faker-js/faker";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

const contactUri = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/Person/854486c1-504a-4e11-9fe4-6d6250f08dfe/index.ttl#this";

const result = await contacts.readContact(contactUri)

if (result.phoneNumbers.length === 0) {
  throw new Error("no phone numbers found, try the add-new-phone-number example")
}

const phoneNumberUri = result.phoneNumbers[0].uri
const oldValue = result.phoneNumbers[0].value

const newPhoneNumber = faker.helpers.fromRegExp(
  /[0-9]{2,4}-[0-9]{2,4}-[0-9]{2,4}-[0-9]{2,4}/,
)

console.log("updating phone number", phoneNumberUri, "from", oldValue, "to", newPhoneNumber)

await contacts.updatePhoneNumber({ phoneNumberUri, newPhoneNumber });

const contact = await contacts.readContact(contactUri)
console.log("updated contact", contact)