import { Fetcher, graph, UpdateManager } from "rdflib";
import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import { mockTurtleResponse } from "../test-support/mockResponses";

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

    mockTurtleResponse(
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
});
