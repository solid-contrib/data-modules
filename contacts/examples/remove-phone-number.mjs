import ContactsModule from '../dist/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

const contactUri = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/Person/854486c1-504a-4e11-9fe4-6d6250f08dfe/index.ttl#this";

const result = await contacts.readContact(contactUri)

if (result.phoneNumbers.length === 0) {
  throw new Error("no phone numbers left, try the add-new-phone-number example")
}

const phoneNumberUri = result.phoneNumbers[0].uri

console.log("removing phone number", phoneNumberUri, "from contact", contactUri)

await contacts.removePhoneNumber({ contactUri, phoneNumberUri });

const contact = await contacts.readContact(contactUri)
console.log("updated contact", contact)