import ContactsModule from '../dist/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";
import { faker } from "@faker-js/faker";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

const addressBookUri = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/index.ttl#this"
const addressBook = await contacts.readAddressBook(addressBookUri)

const contactToRename = addressBook.contacts[0]

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const newName = `${firstName} ${lastName}`

console.log('renaming', contactToRename, 'to', newName)

await contacts.renameContact({
  contactUri: contactToRename.uri,
  newName
})

const updatedContact = await contacts.readContact(contactToRename.uri)

console.log("updated contact", updatedContact)
const updatedAddressBook = await contacts.readAddressBook(addressBookUri)
console.log("updated address book", updatedAddressBook)


