import { vcard } from "../namespaces";
import { graph, lit, st, sym } from "rdflib";
import { renameContact } from "./renameContact.js";
import { ContactQuery } from "../queries";

describe("renameContact", () => {
  describe("insertions", () => {
    it("inserts the new name", () => {
      const store = graph();
      const contactNode = sym(
        "https://pod.test/contact/1/Person/1/index.ttl#this",
      );
      const contactQuery = {
        contactNode,
        queryName: () => "Old Name",
      } as unknown as ContactQuery;
      store.add(contactNode, vcard("fn"), lit("Old Name"));
      const result = renameContact(contactQuery, "New Name");
      expect(result.insertions).toContainEqual(
        st(contactNode, vcard("fn"), lit("New Name"), contactNode.doc()),
      );
    });
  });

  describe("deletions", () => {
    it("deletes the old name", () => {
      const store = graph();
      const contactNode = sym(
        "https://pod.test/contact/1/Person/1/index.ttl#this",
      );
      const contactQuery = {
        contactNode,
        queryName: () => "Old Name",
      } as unknown as ContactQuery;
      store.add(contactNode, vcard("fn"), lit("Old Name"));
      const result = renameContact(contactQuery, "New Name");
      expect(result.deletions).toContainEqual(
        st(contactNode, vcard("fn"), lit("Old Name"), contactNode.doc()),
      );
    });
  });
});
