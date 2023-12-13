import {ContactsModule} from '../dist/rdflib/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

const result = await contacts.readContact("http://localhost:3000/alice/public-contacts/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this")
console.log(result)
