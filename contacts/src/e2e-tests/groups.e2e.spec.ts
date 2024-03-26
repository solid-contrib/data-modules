import { setupModule } from "../test-support/setupModule";
import { faker } from "@faker-js/faker";

describe("groups", () => {
  it("can create a new group within an existing address book", async () => {
    const contacts = setupModule();

    const addressBookUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/index.ttl#this";

    const groupName = faker.company.name();
    const uri = await contacts.createNewGroup({
      addressBookUri,
      groupName,
    });

    const result = await contacts.readAddressBook(addressBookUri);

    expect(result.groups).toContainEqual({
      uri,
      name: groupName,
    });
  });

  it("can read a group to get the name and a list all of its members", async () => {
    {
      const contacts = setupModule();

      const groupUri =
        "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Group/1f0d98b1-5eac-4c44-b6e2-29d9784c40cb/index.ttl#this";

      const result = await contacts.readGroup(groupUri);

      expect(result).toEqual({
        uri: "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Group/1f0d98b1-5eac-4c44-b6e2-29d9784c40cb/index.ttl#this",
        name: "Officials",
        members: [
          {
            uri: "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this",
            name: "Molly Braaten",
          },
        ],
      });
    }
  });

  it("can add an existing contact to an existing group", async () => {
    const contacts = setupModule();

    const groupUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Group/88f4eb67-f510-49c8-8d52-9080cd3e489f/index.ttl#this";

    const contactUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/968b9718-036c-40a6-832b-a0732402d8e1/index.ttl#this";

    const groupBefore = await contacts.readGroup(groupUri);
    expect(
      groupBefore.members.some((contact) => contact.uri == contactUri),
    ).toBe(false);

    await contacts.addContactToGroup({ contactUri, groupUri });

    const groupAfter = await contacts.readGroup(groupUri);
    expect(groupAfter.members).toContainEqual({
      uri: "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/968b9718-036c-40a6-832b-a0732402d8e1/index.ttl#this",
      name: "Bran Breda",
    });
  });

  it("can remove a contact from a group", async () => {
    {
      // given a group contains a contact
      const contacts = setupModule();

      const groupUri =
        "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Group/1f0d98b1-5eac-4c44-b6e2-29d9784c40cb/index.ttl#this";

      const contactUri =
        "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this";

      const groupBefore = await contacts.readGroup(groupUri);
      expect(
        groupBefore.members.some((member) => member.uri == contactUri),
      ).toBe(true);

      // when the contact is removed
      await contacts.removeContactFromGroup({ contactUri, groupUri });

      // then it should no longer be found in the list of members
      const groupAfter = await contacts.readGroup(groupUri);
      expect(
        groupAfter.members.some((member) => member.uri == contactUri),
      ).toBe(false);
    }
  });
});
