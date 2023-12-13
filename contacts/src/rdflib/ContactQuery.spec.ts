import { ContactQuery } from "./ContactQuery";
import { graph, lit, sym } from "rdflib";
import { rdf, vcard } from "./namespaces";

describe("ContactQuery", () => {
  describe("query name", () => {
    it("returns nothing if store is empty", () => {
      const store = graph();

      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryName();
      expect(result).toEqual("");
    });

    it("returns the contact's vcard:fn from the contact document", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("fn"),
        lit("Bob"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryName();
      expect(result).toEqual("Bob");
    });

    it("returns nothing if vcard:fn is from wrong contact", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#other"),
        vcard("fn"),
        lit("Bob"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryName();
      expect(result).toEqual("");
    });

    it("returns nothing, if vcard:fn is missing", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        rdf("type"),
        vcard("Individual"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryName();
      expect(result).toEqual("");
    });
  });
});
