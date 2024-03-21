import { setupModule } from "../test-support/setupModule.js";

describe("address books", () => {
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
      "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/index.ttl#this",
    );
    expect(result).toEqual({
      uri: "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/index.ttl#this",
      title: "Business contacts",
      contacts: [
        {
          uri: "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/Person/130c2add-8538-4127-9e55-feed49468621/index.ttl#this",
          name: "Liza Rusudan",
        },
      ],
      groups: [
        {
          name: "ACME Corp.",
          uri: "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/Group/f027e045-5b4b-46b0-b9c0-b0f5418bc97a/index.ttl#this",
        },
        {
          name: "Colleagues",
          uri: "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/Group/dc27d717-9587-48d5-a58a-a5b29dd99c64/index.ttl#this",
        },
      ],
    });
  });

  it("lists all address books from private and public type index", async () => {
    const contacts = setupModule();
    const result = await contacts.listAddressBooks(
      "http://localhost:3456/profile/card#me",
    );
    expect(result.publicUris).toEqual([
      "http://localhost:3456/a21d8717-6113-47e3-8f8f-f35dc33ffbe2/index.ttl#this",
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/index.ttl#this",
    ]);
    expect(result.privateUris).toEqual([
      "http://localhost:3456/7e9b9a6d-f203-4e3b-ab7f-658e84ea461c/index.ttl#this",
      "http://localhost:3456/cd37cf7b-5fbb-4b09-bb0f-3236f9e97343/index.ttl#this",
    ]);
  });
});
