import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";
import {
  mockNotFound,
  mockTurtleResponse,
} from "../test-support/mockResponses";

import { v4 as uuid } from "uuid";
import { expectPatchRequest } from "../test-support/expectRequests";
import { Fetcher, graph, UpdateManager } from "rdflib";

jest.mock("uuid");

describe("read contact", () => {
  it("returns the contact's name", async () => {
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

    expect(result).toEqual({ name: "Bob" });
  });
});
