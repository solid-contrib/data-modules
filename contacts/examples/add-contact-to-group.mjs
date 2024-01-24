import {ContactsModuleRdfLib as ContactsModule} from '../dist/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";
import {faker} from "@faker-js/faker";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);
const contacts = new ContactsModule({store, fetcher, updater});

const contactUri = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/Person/854486c1-504a-4e11-9fe4-6d6250f08dfe/index.ttl#this";
const groupUri = "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/Group/41faaf6f-37c3-437a-900d-e6a0e6c92463/index.ttl#this";

await contacts.addContactToGroup({
    contactUri,
    groupUri,
});
console.log("added contact", contactUri, "to group", groupUri);

const result = await contacts.readGroup(groupUri);
console.log("the updated group:", result);
