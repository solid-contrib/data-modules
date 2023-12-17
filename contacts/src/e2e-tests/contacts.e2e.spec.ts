import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModule } from "../rdflib";
import { faker } from "@faker-js/faker";

describe("contacts module", () => {
  beforeAll(async () => {
    const response = await fetch("http://localhost:3000/alice/");
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

  it("can read a existing contact", async () => {
    const store = graph();
    const fetcher = new Fetcher(store);
    const updater = new UpdateManager(store);
    const contacts = new ContactsModule({ store, fetcher, updater });

    const contactUri =
      "http://localhost:3000/alice/public-contacts/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this";

    const result = await contacts.readContact(contactUri);

    expect(result).toEqual({
      uri: "http://localhost:3000/alice/public-contacts/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this",
      name: "Molly Braaten",
      emails: [
        {
          uri: "http://localhost:3000/alice/public-contacts/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#id1702497197769",
          value: "molly.braaten@gov.test",
        },
        {
          uri: "http://localhost:3000/alice/public-contacts/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#id1702500031124",
          value: "molly.braaten@home.test",
        },
      ],
      phoneNumbers: [
        {
          uri: "http://localhost:3000/alice/public-contacts/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#id1702497210116",
          value: "+1234567890",
        },
        {
          uri: "http://localhost:3000/alice/public-contacts/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#id1702500092868",
          value: "+0987654321",
        },
      ],
    });
  });
});
