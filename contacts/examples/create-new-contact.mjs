import {ContactsModule} from '../dist/rdflib/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";
import {faker} from '@faker-js/faker';


const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

let addressBook = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/index.ttl#this";

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const uri = await contacts.createNewContact({
    addressBook: addressBook,
    contact: {
        name: firstName + " " + lastName,
        email: faker.internet.email({firstName, lastName})
    }
})
console.log("created contact:", firstName, lastName, uri)

const result = await contacts.readAddressBook(addressBook)
console.log("the updated address book:", result)
