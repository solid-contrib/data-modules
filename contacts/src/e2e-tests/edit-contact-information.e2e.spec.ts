import { setupModule } from "../test-support/setupModule";

describe("edit contact information", () => {
  it("can add a new phone number to an existing contact", async () => {
    const contacts = setupModule();

    const contactUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this";

    const newPhoneNumber = "01189998819991197253";

    const contactBefore = await contacts.readContact(contactUri);

    expect(
      contactBefore.phoneNumbers.some(
        (phone) => phone.value === newPhoneNumber,
      ),
    ).toBe(false);

    const uri = await contacts.addNewPhoneNumber({
      contactUri,
      newPhoneNumber,
    });

    const contactAfter = await contacts.readContact(contactUri);

    expect(contactAfter.phoneNumbers).toContainEqual(
      expect.objectContaining({
        uri,
        value: newPhoneNumber,
      }),
    );
  });

  it("can add a new email address to an existing contact", async () => {
    const contacts = setupModule();

    const contactUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this";

    const newEmailAddress = "alice@pod.test";

    const contactBefore = await contacts.readContact(contactUri);

    expect(
      contactBefore.emails.some((email) => email.value === newEmailAddress),
    ).toBe(false);

    const uri = await contacts.addNewEmailAddress({
      contactUri,
      newEmailAddress,
    });

    const contactAfter = await contacts.readContact(contactUri);

    expect(contactAfter.emails).toContainEqual(
      expect.objectContaining({
        uri,
        value: newEmailAddress,
      }),
    );
  });

  it("removes an existing phone number", async () => {
    const contacts = setupModule();

    const contactUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this";

    const phoneNumberUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#id1702497210116";

    const contactBefore = await contacts.readContact(contactUri);

    expect(contactBefore.phoneNumbers).toContainEqual(
      expect.objectContaining({
        uri: phoneNumberUri,
        value: "+1234567890",
      }),
    );

    await contacts.removePhoneNumber({ contactUri, phoneNumberUri });

    const contactAfter = await contacts.readContact(contactUri);
    expect(contactAfter.phoneNumbers).not.toContainEqual(
      expect.objectContaining({
        uri: phoneNumberUri,
        value: "+1234567890",
      }),
    );
  });

  it("removes an existing email address", async () => {
    const contacts = setupModule();

    const contactUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#this";

    const emailAddressUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/1973dcec-e71c-476c-87db-0d3332291214/index.ttl#id1702500031124";

    const contactBefore = await contacts.readContact(contactUri);

    expect(contactBefore.emails).toContainEqual(
      expect.objectContaining({
        uri: emailAddressUri,
        value: "molly.braaten@home.test",
      }),
    );

    await contacts.removeEmailAddress({ contactUri, emailAddressUri });

    const contactAfter = await contacts.readContact(contactUri);
    expect(contactAfter.emails).not.toContainEqual(
      expect.objectContaining({
        uri: emailAddressUri,
        value: "molly.braaten@home.test",
      }),
    );
  });

  it("updates an existing phone number", async () => {
    const contacts = setupModule();

    const contactUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/EZCodK/index.ttl#this";

    const contactBefore = await contacts.readContact(contactUri);
    const phoneNumber = contactBefore.phoneNumbers[0];

    expect(contactBefore.phoneNumbers).toEqual([
      {
        uri: phoneNumber.uri,
        value: "+1-491-303-1336",
      },
    ]);

    await contacts.updatePhoneNumber({
      phoneNumberUri: phoneNumber.uri,
      newPhoneNumber: "+1-600-792-9224",
    });

    const contactAfter = await contacts.readContact(contactUri);
    expect(contactAfter.phoneNumbers).toEqual([
      {
        uri: phoneNumber.uri,
        value: "+1-600-792-9224",
      },
    ]);
  });

  it("updates an existing email address", async () => {
    const contacts = setupModule();

    const contactUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/Person/EZCodK/index.ttl#this";

    const contactBefore = await contacts.readContact(contactUri);
    const emailAddress = contactBefore.emails[0];

    expect(contactBefore.emails).toEqual([
      {
        uri: emailAddress.uri,
        value: "winifred-watsica@mail.test",
      },
    ]);

    await contacts.updateEmailAddress({
      emailAddressUri: emailAddress.uri,
      newEmailAddress: "w.watsica@new-value.test",
    });

    const contactAfter = await contacts.readContact(contactUri);
    expect(contactAfter.emails).toEqual([
      {
        uri: emailAddress.uri,
        value: "w.watsica@new-value.test",
      },
    ]);
  });

  it("renames an existing contact", async () => {
    const contacts = setupModule();

    const addressBookUri =
      "http://localhost:3456/4243dbb6-3126-4bf9-9ea7-45e35c3c8d9d/index.ttl#this";

    const addressBookBefore = await contacts.readAddressBook(addressBookUri);

    const contactToRename = addressBookBefore.contacts.find(
      (it) => it.name === "Molly Braaten",
    );

    if (!contactToRename) {
      fail("contact to rename not present");
    }

    await contacts.renameContact({
      contactUri: contactToRename.uri,
      newName: "Mollie Brateen",
    });

    const renamedContact = await contacts.readContact(contactToRename.uri);
    expect(renamedContact.name).toEqual("Mollie Brateen");

    const addressBookAfter = await contacts.readAddressBook(addressBookUri);
    expect(addressBookAfter.contacts).toContainEqual({
      uri: contactToRename.uri,
      name: "Mollie Brateen",
    });
  });
});
