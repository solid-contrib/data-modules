import { vcard } from "../namespaces.js";
import { graph, lit, st, sym } from "rdflib";
import { renameContact } from "./renameContact.js";

describe("renameContact", () => {
  describe("insertions", () => {
    it("inserts the new name to the contact document", () => {
      const store = graph();
      const contactNode = sym(
        "https://pod.test/contact/1/Person/1/index.ttl#this",
      );
      const contactDoc = contactNode.doc();
      store.add(contactNode, vcard("fn"), lit("Old Name"), contactDoc);
      const result = renameContact(store, contactNode, "New Name");
      expect(result.insertions).toContainEqual(
        st(contactNode, vcard("fn"), lit("New Name"), contactNode.doc()),
      );
    });

    it("inserts the new name to all known name-email indexes", () => {
      const store = graph();
      const contactNode = sym(
        "https://pod.test/contact/1/Person/1/index.ttl#this",
      );

      const index1 = sym("https://pod.test/contact/1/people.ttl");
      const index2 = sym("https://pod.test/contact/2/people.ttl");

      store.add(contactNode, vcard("fn"), lit("Old Name"), index1);
      store.add(contactNode, vcard("fn"), lit("Even Older Name"), index2);

      const result = renameContact(store, contactNode, "New Name");
      expect(result.insertions).toContainEqual(
        st(contactNode, vcard("fn"), lit("New Name"), index1),
      );
      expect(result.insertions).toContainEqual(
        st(contactNode, vcard("fn"), lit("New Name"), index2),
      );
    });
  });

  describe("deletions", () => {
    it("deletes the old name from the contact document", () => {
      const store = graph();
      const contactNode = sym(
        "https://pod.test/contact/1/Person/1/index.ttl#this",
      );
      const contactDoc = contactNode.doc();
      store.add(contactNode, vcard("fn"), lit("Old Name"), contactDoc);
      const result = renameContact(store, contactNode, "New Name");
      expect(result.deletions).toContainEqual(
        st(contactNode, vcard("fn"), lit("Old Name"), contactDoc),
      );
    });

    it("deletes the old name from all known name-email indexes", () => {
      const store = graph();
      const contactNode = sym(
        "https://pod.test/contact/1/Person/1/index.ttl#this",
      );

      const index1 = sym("https://pod.test/contact/1/people.ttl");
      const index2 = sym("https://pod.test/contact/2/people.ttl");

      store.add(contactNode, vcard("fn"), lit("Old Name"), index1);
      store.add(contactNode, vcard("fn"), lit("Even Older Name"), index2);

      const result = renameContact(store, contactNode, "New Name");
      expect(result.deletions).toContainEqual(
        st(contactNode, vcard("fn"), lit("Old Name"), index1),
      );
      expect(result.deletions).toContainEqual(
        st(contactNode, vcard("fn"), lit("Even Older Name"), index2),
      );
    });
  });
});
