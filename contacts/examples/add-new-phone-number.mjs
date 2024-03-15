import ContactsModule from '../dist/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

import { faker } from "@faker-js/faker";

const contactUri = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/Person/854486c1-504a-4e11-9fe4-6d6250f08dfe/index.ttl#this";

const phoneNumber = faker.helpers.fromRegExp(
  /[0-9]{2,4}-[0-9]{2,4}-[0-9]{2,4}-[0-9]{2,4}/,
)

const result = await contacts.addNewPhoneNumber(contactUri, phoneNumber)
console.log("newly added phone number:", result)

const contact = await contacts.readContact(contactUri)
console.log("updated contact", contact)