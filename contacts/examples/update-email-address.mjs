import ContactsModule from '../dist/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";
import { faker } from "@faker-js/faker";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

const contactUri = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/Person/854486c1-504a-4e11-9fe4-6d6250f08dfe/index.ttl#this";

const result = await contacts.readContact(contactUri)

if (result.emails.length === 0) {
  throw new Error("no email address left, try the add-new-email-address example")
}

const emailAddressUri = result.emails[0].uri
const oldValue = result.emails[0].value

const newEmailAddress = faker.internet.email();

console.log("updating email address", emailAddressUri, "from", oldValue, "to", newEmailAddress)

await contacts.updateEmailAddress({ emailAddressUri, newEmailAddress });

const contact = await contacts.readContact(contactUri)
console.log("updated contact", contact)