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
});
