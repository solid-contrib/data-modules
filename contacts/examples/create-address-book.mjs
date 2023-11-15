import {ContactsModule} from '../dist/rdflib/index.js';

const contacts = new ContactsModule({})

const uri = await contacts.createAddressBook({
    container: "http://localhost:3000/alice/public-write/",
    name: "new address book"
})

const result = await contacts.readAddressBook(uri)
console.log(result)
