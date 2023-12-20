import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModule } from "../rdflib";
import { faker } from "@faker-js/faker";
import { startServer } from "./start-server";
import { v4 as uuid } from "uuid";

describe("contacts module", () => {
  const testId = uuid();
  beforeAll(async (): Promise<void> => {
    await startServer(testId);
  });

  it("can fetch from the test server", async () => {
    const response = await fetch("http://localhost:3456/");
    expect(response.status).toBe(200);
  });

  it("can create a new address book", async () => {
    const contacts = setupModule();
    const uri = await contacts.createAddressBook({
      containerUri: "http://localhost:3456/",
      name: "Personal contacts",
    });
    expect(uri).toMatch(
      new RegExp("http://localhost:3456/[a-z\\-0-9]+/index.ttl#this"),
    );
  });

  it("can read an existing address book", async () => {
    const contacts = setupModule();
    const result = await contacts.readAddressBook(
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/index.ttl#this",
    );
    expect(result).toEqual({
      uri: "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/index.ttl#this",
      title: "Personal contacts",
      contacts: [
        {
          uri: "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this",
          name: "Molly Braaten",
        },
      ],
      groups: [],
    });
  });

  it("can create a new contact within an existing address book", async () => {
    const contacts = setupModule();

    const addressBookUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/index.ttl#this";

    const name = faker.person.fullName();
    const uri = await contacts.createNewContact({
      addressBookUri,
      contact: {
        name: name,
      },
    });

    const result = await contacts.readAddressBook(addressBookUri);

    expect(result.contacts).toContainEqual({
      uri,
      name,
    });
  });

  it("can read a existing contact", async () => {
    const contacts = setupModule();

    const contactUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this";

    const result = await contacts.readContact(contactUri);

    expect(result).toEqual({
      uri: "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this",
      name: "Molly Braaten",
      emails: [
        {
          uri: "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#id1702497197769",
          value: "molly.braaten@gov.test",
        },
        {
          uri: "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#id1702500031124",
          value: "molly.braaten@home.test",
        },
      ],
      phoneNumbers: [
        {
          uri: "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#id1702497210116",
          value: "+1234567890",
        },
        {
          uri: "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#id1702500092868",
          value: "+0987654321",
        },
      ],
    });
  });
});

function setupModule() {
  const store = graph();
  const fetcher = new Fetcher(store);
  const updater = new UpdateManager(store);
  return new ContactsModule({ store, fetcher, updater });
}
