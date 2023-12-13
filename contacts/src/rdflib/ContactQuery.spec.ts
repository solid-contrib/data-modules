import { ContactQuery } from "./ContactQuery";
import { graph, lit, sym } from "rdflib";
import { vcard } from "./namespaces";

describe("ContactQuery", () => {
  describe("query name", () => {
    it("returns the vcard:fn", () => {
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
  });
});
