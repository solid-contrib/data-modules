import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "../ContactsModuleRdfLib.js";
import { mockTurtleDocument } from "@solid-data-modules/rdflib-utils/test-support";

describe("read group", () => {
  it("returns the group's name and uri", async () => {
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

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Group;
        vcard:fn "Officials".
`,
    );

    const result = await contacts.readGroup(
      "https://pod.test/alice/contacts/Group/1/index.ttl#this",
    );

    expect(result).toMatchObject({
      uri: "https://pod.test/alice/contacts/Group/1/index.ttl#this",
      name: "Officials",
    });
  });

  it("returns the group's members", async () => {
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

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/contacts/Group/1/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
  
    <#this> a vcard:Group;
        vcard:hasMember <./Person/1/index.ttl#this>, <Person/2/index.ttl#this> .
        
    <Person/1/index.ttl#this> vcard:fn "Alice" .
    <Person/2/index.ttl#this> vcard:fn "Bob" .
`,
    );

    const result = await contacts.readGroup(
      "https://pod.test/alice/contacts/Group/1/index.ttl#this",
    );

    expect(result).toMatchObject({
      uri: "https://pod.test/alice/contacts/Group/1/index.ttl#this",
      members: [
        {
          uri: "https://pod.test/alice/contacts/Group/1/Person/1/index.ttl#this",
          name: "Alice",
        },
        {
          uri: "https://pod.test/alice/contacts/Group/1/Person/2/index.ttl#this",
          name: "Bob",
        },
      ],
    });
  });
});
