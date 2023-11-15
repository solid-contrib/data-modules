import { when } from "jest-when";
import { ContactsModuleRdfLib } from "./ContactsModuleRdfLib";

describe("read existing address book", () => {
  it("empty address book returns the title and uri but no contacts and groups", async () => {
    const uri = "https://pod.test/alice/contacts/index.ttl#this";

    const authenticatedFetch = jest.fn();

    const contacts = new ContactsModuleRdfLib({
      fetch: authenticatedFetch,
    });

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix ab: <http://www.w3.org/ns/pim/ab#>.
    @prefix dc: <http://purl.org/dc/elements/1.1/>.
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
  
    <#this> a vcard:AddressBook;
        dc:title "Alice's contacts";
        vcard:nameEmailIndex <people.ttl>;
        vcard:groupIndex <groups.ttl>.
`,
    );
    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/people.ttl",
      "",
    );

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/groups.ttl",
      "",
    );

    const result = await contacts.readAddressBook(uri);
    expect(result).toEqual({
      uri: "https://pod.test/alice/contacts/index.ttl#this",
      title: "Alice's contacts",
      contacts: [],
      groups: [],
    });
  });

  it("all contacts are listed", async () => {
    const uri = "https://pod.test/alice/contacts/index.ttl#this";

    const authenticatedFetch = jest.fn();

    const contacts = new ContactsModuleRdfLib({
      fetch: authenticatedFetch,
    });

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix ab: <http://www.w3.org/ns/pim/ab#>.
    @prefix dc: <http://purl.org/dc/elements/1.1/>.
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
  
    <#this> a vcard:AddressBook;
        dc:title "Alice's contacts";
        vcard:nameEmailIndex <people.ttl>;
        vcard:groupIndex <groups.ttl>.
`,
    );
    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/people.ttl",
      `@prefix vcard: <http://www.w3.org/2006/vcard/ns#>.

<https://pod.test/alice/contacts/Person/1/index.ttl#this>
    vcard:inAddressBook <https://pod.test/alice/contacts/index.ttl#this> ;
    vcard:fn            "Alice" .

<https://pod.test/alice/contacts/Person/2/index.ttl#this>
    vcard:inAddressBook <https://pod.test/alice/contacts/index.ttl#this> ;
    vcard:fn            "Bob" .

<https://pod.test/alice/contacts/Person/3/index.ttl#this>
    vcard:inAddressBook <https://pod.test/alice/contacts/index.ttl#this> ;
    vcard:fn            "Claire" .
`,
    );

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/groups.ttl",
      "",
    );

    const result = await contacts.readAddressBook(uri);
    expect(result.contacts).toEqual([
      {
        uri: "https://pod.test/alice/contacts/Person/1/index.ttl#this",
        name: "Alice",
      },
      {
        uri: "https://pod.test/alice/contacts/Person/2/index.ttl#this",
        name: "Bob",
      },
      {
        uri: "https://pod.test/alice/contacts/Person/3/index.ttl#this",
        name: "Claire",
      },
    ]);
  });

  it("all groups are listed", async () => {
    const uri = "https://pod.test/alice/contacts/index.ttl#this";

    const authenticatedFetch = jest.fn();

    const contacts = new ContactsModuleRdfLib({
      fetch: authenticatedFetch,
    });

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/index.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix ab: <http://www.w3.org/ns/pim/ab#>.
    @prefix dc: <http://purl.org/dc/elements/1.1/>.
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
  
    <#this> a vcard:AddressBook;
        dc:title "Alice's contacts";
        vcard:nameEmailIndex <people.ttl>;
        vcard:groupIndex <groups.ttl>.
`,
    );
    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/people.ttl",
      "",
    );

    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/alice/contacts/groups.ttl",
      `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.

    <https://pod.test/alice/contacts/index.ttl#this>
        vcard:includesGroup
            <https://pod.test/alice/contacts/Group/1/index.ttl#this>,
            <https://pod.test/alice/contacts/Group/2/index.ttl#this>,
            <https://pod.test/alice/contacts/Group/3/index.ttl#this>
    .
    
    <https://pod.test/alice/contacts/Group/1/index.ttl#this>
        a vcard:Group ;
        vcard:fn            "Family" .
        
    <https://pod.test/alice/contacts/Group/2/index.ttl#this>
        a vcard:Group ;
        vcard:fn            "Friends" .
    
    <https://pod.test/alice/contacts/Group/3/index.ttl#this>
        a vcard:Group ;
        vcard:fn            "Work" .
      `,
    );

    const result = await contacts.readAddressBook(uri);
    expect(result.groups).toEqual([
      {
        uri: "https://pod.test/alice/contacts/Group/1/index.ttl#this",
        name: "Family",
      },
      {
        uri: "https://pod.test/alice/contacts/Group/2/index.ttl#this",
        name: "Friends",
      },
      {
        uri: "https://pod.test/alice/contacts/Group/3/index.ttl#this",
        name: "Work",
      },
    ]);
  });
});

function mockTurtleResponse(fetch: jest.Mock, uri: string, ttl: string) {
  when(fetch)
    .calledWith(uri, expect.anything())
    .mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "Content-Type": "text/turtle",
      }),
      text: () => Promise.resolve(ttl),
    } as Response);
}
