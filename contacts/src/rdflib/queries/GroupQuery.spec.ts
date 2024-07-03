import { graph, lit, sym } from "rdflib";
import { GroupQuery } from "./GroupQuery";
import { vcard } from "../namespaces";
import { rdf } from "@solid-data-modules/rdflib-utils";

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
  describe("query members", () => {
    it("returns an empty array if nothing found in store", () => {
      const query = new GroupQuery(
        graph(),
        sym("http://pod.test/alice/contacts/1/group/1/index.ttl#this"),
      );
      const result = query.queryMembers();
      expect(result).toEqual([]);
    });
    it("returns a single contact with name and URI", () => {
      const store = graph();
      const groupNode = sym(
        "http://pod.test/alice/contacts/1/group/1/index.ttl#this",
      );
      store.add(
        groupNode,
        vcard("hasMember"),
        sym("http://pod.test/alice/contacts/Person/1#this"),
        groupNode.doc(),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("fn"),
        lit("Bob"),
        groupNode.doc(),
      );
      const query = new GroupQuery(store, groupNode);
      const result = query.queryMembers();
      expect(result).toEqual([
        {
          uri: "http://pod.test/alice/contacts/Person/1#this",
          name: "Bob",
        },
      ]);
    });

    it("returns all contacts with name and URI", () => {
      const store = graph();
      const groupNode = sym(
        "http://pod.test/alice/contacts/1/group/1/index.ttl#this",
      );

      store.add(
        groupNode,
        vcard("hasMember"),
        sym("http://pod.test/alice/contacts/Person/1#this"),
        groupNode.doc(),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("fn"),
        lit("Alice"),
        groupNode.doc(),
      );
      store.add(
        groupNode,
        vcard("hasMember"),
        sym("http://pod.test/alice/contacts/Person/2#this"),
        groupNode.doc(),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/2#this"),
        vcard("fn"),
        lit("Bob"),
        groupNode.doc(),
      );

      const query = new GroupQuery(
        store,
        sym("http://pod.test/alice/contacts/1/group/1/index.ttl#this"),
      );
      const result = query.queryMembers();
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

    it("ignores members that are not named nodes", () => {
      const store = graph();
      const groupNode = sym(
        "http://pod.test/alice/contacts/1/group/1/index.ttl#this",
      );
      store.add(groupNode, vcard("hasMember"), lit("Bob"), groupNode.doc());

      const query = new GroupQuery(store, groupNode);
      const result = query.queryMembers();
      expect(result).toEqual([]);
    });

    it("does not return a member from wrong group", () => {
      const store = graph();
      const groupNode = sym(
        "http://pod.test/alice/contacts/1/group/1/index.ttl#this",
      );
      const wrongGroup = sym(
        "http://pod.test/alice/contacts/1/group/wrong/index.ttl#this",
      );
      store.add(
        wrongGroup,
        vcard("hasMember"),
        sym("http://pod.test/alice/contacts/Person/1#this"),
        groupNode.doc(),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("fn"),
        lit("Bob"),
        groupNode.doc(),
      );
      const query = new GroupQuery(store, groupNode);
      const result = query.queryMembers();
      expect(result).toEqual([]);
    });

    it("does not return a member from wrong group document", () => {
      const store = graph();
      const groupNode = sym(
        "http://pod.test/alice/contacts/1/group/1/index.ttl#this",
      );
      store.add(
        groupNode,
        vcard("hasMember"),
        sym("http://pod.test/alice/contacts/Person/1#this"),
        sym("http://pod.test/wrong/contacts/Person/1#this"),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("fn"),
        lit("Bob"),
        groupNode.doc(),
      );
      const query = new GroupQuery(store, groupNode);
      const result = query.queryMembers();
      expect(result).toEqual([]);
    });

    it("does not return a contact name from outside the group doc", () => {
      const store = graph();
      const groupNode = sym(
        "http://pod.test/alice/contacts/1/group/1/index.ttl#this",
      );
      store.add(
        groupNode,
        vcard("hasMember"),
        sym("http://pod.test/alice/contacts/Person/1#this"),
        groupNode.doc(),
      );
      store.add(
        sym("http://pod.test/alice/contacts/Person/1#this"),
        vcard("fn"),
        lit("Bob"),
        sym("http://other.test/document"),
      );
      const query = new GroupQuery(store, groupNode);
      const result = query.queryMembers();
      expect(result).toEqual([
        {
          uri: "http://pod.test/alice/contacts/Person/1#this",
          name: "",
        },
      ]);
    });
  });
});
