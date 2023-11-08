import { AddressBookQuery } from "./AddressBookQuery";
import { graph, sym } from "rdflib";
import { dc, vcard } from "./namespaces";

describe("AddressBookQuery", () => {
  describe("query title", () => {
    it("returns an empty string if nothing found in store", () => {
      const query = new AddressBookQuery(
        graph(),
        sym("http://pod.test/alice/contacts/index.ttl#this"),
      );
      const title = query.queryTitle();
      expect(title).toBe("");
    });
    it("returns the dc:title found in store", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      store.add(
        addressBookNode,
        dc("title"),
        "my contacts",
        addressBookNode.doc(),
      );
      const query = new AddressBookQuery(store, addressBookNode);
      const title = query.queryTitle();
      expect(title).toBe("my contacts");
    });
    it("returns an empty string if title is from wrong document", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      store.add(
        addressBookNode,
        dc("title"),
        "my contacts",
        sym("http://pod.test/wrong/doc"),
      );
      const query = new AddressBookQuery(store, addressBookNode);
      const title = query.queryTitle();
      expect(title).toBe("");
    });
    it("returns an empty string if title is from wrong address book", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      store.add(
        sym("http://pod.test/alice/wrong/index.ttl#this"),
        dc("title"),
        "my contacts",
        addressBookNode.doc(),
      );
      const query = new AddressBookQuery(store, addressBookNode);
      const title = query.queryTitle();
      expect(title).toBe("");
    });
  });

  describe("query name-email index", () => {
    it("returns null if nothing found in store", () => {
      const query = new AddressBookQuery(
        graph(),
        sym("http://pod.test/alice/contacts/index.ttl#this"),
      );
      const result = query.queryNameEmailIndex();
      expect(result).toBe(null);
    });

    it("returns the node found in store", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      const peopleNode = sym("http://pod.test/alice/contacts/people.ttl");
      store.add(
        addressBookNode,
        vcard("nameEmailIndex"),
        peopleNode,
        addressBookNode.doc(),
      );
      const query = new AddressBookQuery(store, addressBookNode);
      const result = query.queryNameEmailIndex();
      expect(result).toBe(peopleNode);
    });

    it("returns null if statement is from wrong document", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      const peopleNode = sym("http://pod.test/alice/contacts/people.ttl");
      store.add(
        addressBookNode,
        vcard("nameEmailIndex"),
        peopleNode,
        sym("http://pod.test/wrong/doc"),
      );
      const query = new AddressBookQuery(store, addressBookNode);
      const title = query.queryNameEmailIndex();
      expect(title).toBe(null);
    });

    it("returns null if statement is from wrong address book", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      const peopleNode = sym("http://pod.test/alice/contacts/people.ttl");
      store.add(
        sym("http://pod.test/alice/wrong/index.ttl#this"),
        vcard("nameEmailIndex"),
        peopleNode,
        addressBookNode.doc(),
      );
      const query = new AddressBookQuery(store, addressBookNode);
      const result = query.queryNameEmailIndex();
      expect(result).toBe(null);
    });
  });

  describe("query contacts", () => {
    it("returns an empty array if nothing found in store", () => {
      const query = new AddressBookQuery(
        graph(),
        sym("http://pod.test/alice/contacts/index.ttl#this"),
      );
      const result = query.queryContacts();
      expect(result).toEqual([]);
    });

    it("returns a single contact with name and URI", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      const peopleNode = sym("http://pod.test/alice/contacts/people.ttl");

      store.add(
        addressBookNode,
        vcard("nameEmailIndex"),
        peopleNode,
        addressBookNode.doc(),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("inAddressBook"),
        addressBookNode,
        peopleNode,
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("fn"),
        "Alice",
        peopleNode,
      );
      const query = new AddressBookQuery(
        store,
        sym("http://pod.test/alice/contacts/index.ttl#this"),
      );
      const result = query.queryContacts();
      expect(result).toEqual([
        {
          uri: "http://pod.test/alice/contacts/Person/1#this",
          name: "Alice",
        },
      ]);
    });

    it("returns all contacts with name and URI", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      const peopleNode = sym("http://pod.test/alice/contacts/people.ttl");

      store.add(
        addressBookNode,
        vcard("nameEmailIndex"),
        peopleNode,
        addressBookNode.doc(),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("inAddressBook"),
        addressBookNode,
        peopleNode,
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/2#this"),
        vcard("inAddressBook"),
        addressBookNode,
        peopleNode,
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("fn"),
        "Alice",
        peopleNode,
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/2#this"),
        vcard("fn"),
        "Bob",
        peopleNode,
      );
      const query = new AddressBookQuery(
        store,
        sym("http://pod.test/alice/contacts/index.ttl#this"),
      );
      const result = query.queryContacts();
      expect(result).toEqual([
        {
          uri: "http://pod.test/alice/contacts/Person/1#this",
          name: "Alice",
        },
        {
          uri: "http://pod.test/alice/contacts/Person/2#this",
          name: "Bob",
        },
      ]);
    });

    it("does not return a contact from wrong name-email index", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      const peopleNode = sym("http://pod.test/alice/contacts/people.ttl");
      const wrongPeopleNode = sym("http://pod.test/alice/wrong/people.ttl");

      store.add(
        addressBookNode,
        vcard("nameEmailIndex"),
        peopleNode,
        addressBookNode.doc(),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("inAddressBook"),
        addressBookNode,
        wrongPeopleNode,
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("fn"),
        "Alice",
        peopleNode,
      );
      const query = new AddressBookQuery(
        store,
        sym("http://pod.test/alice/contacts/index.ttl#this"),
      );
      const result = query.queryContacts();
      expect(result).toEqual([]);
    });

    it("does not return a name from wrong name-email index", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      const peopleNode = sym("http://pod.test/alice/contacts/people.ttl");
      const wrongPeopleNode = sym("http://pod.test/alice/wrong/people.ttl");

      store.add(
        addressBookNode,
        vcard("nameEmailIndex"),
        peopleNode,
        addressBookNode.doc(),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("inAddressBook"),
        addressBookNode,
        peopleNode,
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("fn"),
        "Alice",
        wrongPeopleNode,
      );
      const query = new AddressBookQuery(
        store,
        sym("http://pod.test/alice/contacts/index.ttl#this"),
      );
      const result = query.queryContacts();
      expect(result).toEqual([
        {
          name: "",
          uri: "http://pod.test/alice/contacts/Person/1#this",
        },
      ]);
    });

    it("does not return a contact from wrong address book", () => {
      const store = graph();
      const addressBookNode = sym(
        "http://pod.test/alice/contacts/index.ttl#this",
      );
      const peopleNode = sym("http://pod.test/alice/contacts/people.ttl");
      const wrongAddressBookNode = sym(
        "http://pod.test/wrong/contacts/index.ttl#this",
      );

      store.add(
        addressBookNode,
        vcard("nameEmailIndex"),
        peopleNode,
        addressBookNode.doc(),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("inAddressBook"),
        wrongAddressBookNode,
        peopleNode,
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("fn"),
        "Alice",
        peopleNode,
      );
      const query = new AddressBookQuery(
        store,
        sym("http://pod.test/alice/contacts/index.ttl#this"),
      );
      const result = query.queryContacts();
      expect(result).toEqual([]);
    });
  });
});
