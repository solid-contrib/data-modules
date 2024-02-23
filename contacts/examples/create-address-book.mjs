import ContactsModule from '../dist/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

const uri = await contacts.createAddressBook({
    containerUri: "http://localhost:3000/alice/public-write/",
    name: "new address book"
})

const result = await contacts.readAddressBook(uri)
console.log(result)
