import ContactsModule from '../dist/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)
const contacts = new ContactsModule({store, fetcher, updater})

const result = await contacts.readGroup("http://localhost:3000/alice/public-contacts/Group/officials.ttl#this")
console.log(result)
