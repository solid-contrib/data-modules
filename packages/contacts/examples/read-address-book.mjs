import {ContactsModule} from '../dist/rdflib/index.js';

const contacts = new ContactsModule({})

const result = await contacts.readAddressBook("http://localhost:3000/alice/public-contacts/index.ttl#this")
console.log(result)
