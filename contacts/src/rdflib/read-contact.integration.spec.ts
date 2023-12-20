import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import { mockTurtleResponse } from "../test-support/mockResponses";

import { Fetcher, graph, UpdateManager } from "rdflib";

jest.mock("uuid");

describe("read contact", () => {
  it("returns the contact's name and uri", async () => {
    const authenticatedFetch = jest.fn();

    const store = graph();
    const fetcher = new Fetcher(store, {
      fetch: authenticatedFetch,
    });
    const updater = new UpdateManager(store);
    const contacts = new ContactsModuleRdfLib({
      store,
      fetcher,
      updater,
    });

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Individual;
        vcard:fn "Bob".
`,
    );

    const result = await contacts.readContact(
      "https://pod.test/alice/contacts/Person/1/index.ttl#this",
    );

    expect(result).toMatchObject({
      uri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
      name: "Bob",
    });
  });

  it("returns the contact's emails", async () => {
    const authenticatedFetch = jest.fn();

    const store = graph();
    const fetcher = new Fetcher(store, {
      fetch: authenticatedFetch,
    });
    const updater = new UpdateManager(store);
    const contacts = new ContactsModuleRdfLib({
      store,
      fetcher,
      updater,
    });

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Individual;
        vcard:fn "Bob" ;
        vcard:hasEmail <#email>, <#email2> .
    <#email> vcard:value <mailto:bob@mail.test> .
    <#email2> vcard:value <mailto:bob@provider.test> .
`,
    );

    const result = await contacts.readContact(
      "https://pod.test/alice/contacts/Person/1/index.ttl#this",
    );

    expect(result).toMatchObject({
      emails: [
        {
          uri: "https://pod.test/alice/contacts/Person/1/index.ttl#email",
          value: "bob@mail.test",
        },
        {
          uri: "https://pod.test/alice/contacts/Person/1/index.ttl#email2",
          value: "bob@provider.test",
        },
      ],
    });
  });

  it("returns the contact's phone numbers", async () => {
    const authenticatedFetch = jest.fn();

    const store = graph();
    const fetcher = new Fetcher(store, {
      fetch: authenticatedFetch,
    });
    const updater = new UpdateManager(store);
    const contacts = new ContactsModuleRdfLib({
      store,
      fetcher,
      updater,
    });

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Person/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Individual;
        vcard:fn "Bob" ;
        vcard:hasTelephone <#phone>, <#phone2> .
    <#phone> vcard:value <tel:1234> .
    <#phone2> vcard:value <tel:5678> .
`,
    );

    const result = await contacts.readContact(
      "https://pod.test/alice/contacts/Person/1/index.ttl#this",
    );

    expect(result).toMatchObject({
      phoneNumbers: [
        {
          uri: "https://pod.test/alice/contacts/Person/1/index.ttl#phone",
          value: "1234",
        },
        {
          uri: "https://pod.test/alice/contacts/Person/1/index.ttl#phone2",
          value: "5678",
        },
      ],
    });
  });
});
