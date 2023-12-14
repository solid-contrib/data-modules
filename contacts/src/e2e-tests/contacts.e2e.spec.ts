import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModule } from "../rdflib";
import { faker } from "@faker-js/faker";

describe("contacts module", () => {
  beforeAll(async () => {
    const response = await fetch("http://localhost:3000");
    expect(response.status).toBe(200);
  });
  it("can create a new contact within an existing address book", async () => {
    const store = graph();
    const fetcher = new Fetcher(store);
    const updater = new UpdateManager(store);
    const contacts = new ContactsModule({ store, fetcher, updater });

    const addressBook =
      "http://localhost:3000/alice/public-write/ab9694d6-120e-415d-a315-90cd84c2e062/index.ttl#this";

    const name = faker.person.fullName();
    const uri = await contacts.createNewContact({
      addressBook,
      contact: {
        name: name,
      },
    });

    const result = await contacts.readAddressBook(addressBook);

    expect(result.contacts).toContainEqual({
      uri,
      name,
    });
  });
});
