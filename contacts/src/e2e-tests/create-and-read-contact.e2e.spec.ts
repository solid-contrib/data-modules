import { faker } from "@faker-js/faker";
import { setupModule } from "../test-support/setupModule.js";

describe("create and read contact", () => {
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
      "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/Person/130c2add-8538-4127-9e55-feed49468621/index.ttl#this";

    const result = await contacts.readContact(contactUri);

    expect(result).toEqual({
      uri: "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/Person/130c2add-8538-4127-9e55-feed49468621/index.ttl#this",
      name: "Liza Rusudan",
      emails: [
        {
          uri: "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/Person/130c2add-8538-4127-9e55-feed49468621/index.ttl#email-1",
          value: "liza.rusudan@work.test",
        },
        {
          uri: "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/Person/130c2add-8538-4127-9e55-feed49468621/index.ttl#email-2",
          value: "liza.rusudan@home.test",
        },
      ],
      phoneNumbers: [
        {
          uri: "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/Person/130c2add-8538-4127-9e55-feed49468621/index.ttl#phone-1",
          value: "+11122233",
        },
        {
          uri: "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/Person/130c2add-8538-4127-9e55-feed49468621/index.ttl#phone-2",
          value: "+444555666",
        },
      ],
    });
  });

  it("can create a new contact within existing groups", async () => {
    // given an address book and two groups
    const contacts = setupModule();

    const addressBookUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/index.ttl#this";
    const firstGroupUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Group/88f4eb67-f510-49c8-8d52-9080cd3e489f/index.ttl#this";
    const secondGroupUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Group/302b600a-32bd-4848-a6d2-5b47c1e2165c/index.ttl#this";

    // when a new contact is created within the two groups
    const name = faker.person.fullName();
    const uri = await contacts.createNewContact({
      addressBookUri,
      contact: {
        name: name,
      },
      groupUris: [firstGroupUri, secondGroupUri],
    });

    // then the address book contains the new contact
    const result = await contacts.readAddressBook(addressBookUri);
    expect(result.contacts).toContainEqual({
      uri,
      name,
    });

    // and both groups contain the new contact as well
    const firstGroupResult = await contacts.readGroup(firstGroupUri);
    expect(firstGroupResult.members).toContainEqual({
      uri,
      name,
    });
    const secondGroupResult = await contacts.readGroup(secondGroupUri);
    expect(secondGroupResult.members).toContainEqual({
      uri,
      name,
    });
  });
});
