import { AddressBookQuery } from "./AddressBookQuery";
import { blankNode, graph, sym } from "rdflib";
import { dc } from "./namespaces";

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
      let addressBookNode = sym(
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
      let addressBookNode = sym(
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
      let addressBookNode = sym(
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
});
