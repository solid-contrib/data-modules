import {ContactsModule} from '../dist/rdflib/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

const result = await contacts.readAddressBook("http://localhost:3000/alice/public-contacts/index.ttl#this")
console.log(result)
