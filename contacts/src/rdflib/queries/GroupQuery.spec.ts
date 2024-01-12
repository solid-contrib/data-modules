import { graph, lit, sym } from "rdflib";
import { GroupQuery } from "./GroupQuery";
import { rdf, vcard } from "../namespaces";

describe(GroupQuery.name, () => {
  describe("query name", () => {
    it("returns nothing if store is empty", () => {
      const store = graph();

      const query = new GroupQuery(
        store,
        sym("https://pod.test/alice/group/1/index.ttl#this"),
      );
      const result = query.queryName();
      expect(result).toEqual("");
    });

    it("returns the group's vcard:fn from the group document", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/group/1/index.ttl#this"),
        vcard("fn"),
        lit("Family"),
        sym("https://pod.test/alice/group/1/index.ttl"),
      );
      const query = new GroupQuery(
        store,
        sym("https://pod.test/alice/group/1/index.ttl#this"),
      );
      const result = query.queryName();
      expect(result).toEqual("Family");
    });

    it("returns nothing if vcard:fn is from wrong group", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/group/1/index.ttl#other"),
        vcard("fn"),
        lit("Family"),
        sym("https://pod.test/alice/group/1/index.ttl"),
      );
      const query = new GroupQuery(
        store,
        sym("https://pod.test/alice/group/1/index.ttl#this"),
      );
      const result = query.queryName();
      expect(result).toEqual("");
    });

    it("returns nothing, if vcard:fn is missing", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/group/1/index.ttl#this"),
        rdf("type"),
        vcard("Group"),
        sym("https://pod.test/alice/group/1/index.ttl"),
      );
      const query = new GroupQuery(
        store,
        sym("https://pod.test/alice/group/1/index.ttl#this"),
      );
      const result = query.queryName();
      expect(result).toEqual("");
    });
  });
});
