import {ContactsModule} from '../dist/rdflib/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";
import {faker} from '@faker-js/faker';


const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

let addressBook = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/index.ttl#this";

await contacts.readAddressBook(addressBook)

const name = faker.person.fullName();
const uri = await contacts.createNewContact({
    addressBook: addressBook,
    contact: {
        name: name
    }
})
console.log("created contact:", name, uri)

const result = await contacts.readAddressBook(addressBook)
console.log("the updated address book:", result)
