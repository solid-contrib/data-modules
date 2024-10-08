import { ContactQuery } from "./ContactQuery.js";
import { graph, lit, sym } from "rdflib";
import { vcard } from "../namespaces.js";
import { rdf } from "@solid-data-modules/rdflib-utils";

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
  describe("query emails", () => {
    it("returns empty array if store is empty", () => {
      const store = graph();

      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryEmails();
      expect(result).toEqual([]);
    });

    it("returns an empty array if hasEmail is in wrong document", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasEmail"),
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        sym("https://pod.test/alice/contact/1/wrong.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        vcard("value"),
        sym("mailto:bob@mail.test"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryEmails();
      expect(result).toEqual([]);
    });

    it("returns an empty array if email value is in wrong document", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasEmail"),
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        vcard("value"),
        sym("mailto:bob@mail.test"),
        sym("https://pod.test/alice/contact/1/wrong.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryEmails();
      expect(result).toEqual([]);
    });

    it("returns an empty array if hasEmail is of wrong contact", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/wrong.ttl#this"),
        vcard("hasEmail"),
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        vcard("value"),
        sym("mailto:bob@mail.test"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryEmails();
      expect(result).toEqual([]);
    });

    it("returns an empty array if hasEmail node and value are unrelated", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasEmail"),
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#other"),
        vcard("value"),
        sym("mailto:bob@mail.test"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryEmails();
      expect(result).toEqual([]);
    });

    it("ignores emails that are not a named node", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasEmail"),
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        vcard("value"),
        lit("bob@mail.test"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryEmails();
      expect(result).toEqual([]);
    });

    it("ignores emails that are not a mailto: URI", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasEmail"),
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        vcard("value"),
        sym("https://bob.mail.test"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryEmails();
      expect(result).toEqual([]);
    });

    it("returns a single plain email without mailto prefix", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasEmail"),
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        vcard("value"),
        sym("mailto:bob@mail.test"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryEmails();
      expect(result).toEqual([
        {
          uri: "https://pod.test/alice/contact/1/index.ttl#email",
          value: "bob@mail.test",
        },
      ]);
    });

    it("returns all available emails", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasEmail"),
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasEmail"),
        sym("https://pod.test/alice/contact/1/index.ttl#email2"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#email"),
        vcard("value"),
        sym("mailto:bob@mail.test"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#email2"),
        vcard("value"),
        sym("mailto:bob@provider.test"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryEmails();
      expect(result).toEqual([
        {
          uri: "https://pod.test/alice/contact/1/index.ttl#email",
          value: "bob@mail.test",
        },
        {
          uri: "https://pod.test/alice/contact/1/index.ttl#email2",
          value: "bob@provider.test",
        },
      ]);
    });
  });

  describe("query phone numbers", () => {
    it("returns empty array if store is empty", () => {
      const store = graph();

      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryPhoneNumbers();
      expect(result).toEqual([]);
    });

    it("returns an empty array if hasTelephone is in wrong document", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasTelephone"),
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        sym("https://pod.test/alice/contact/1/wrong.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        vcard("value"),
        sym("tel:1234"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryPhoneNumbers();
      expect(result).toEqual([]);
    });

    it("returns an empty array if phone value is in wrong document", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasTelephone"),
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        vcard("value"),
        sym("tel:1234"),
        sym("https://pod.test/alice/contact/1/wrong.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryPhoneNumbers();
      expect(result).toEqual([]);
    });

    it("returns an empty array if hasTelephone is of wrong contact", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/wrong.ttl#this"),
        vcard("hasTelephone"),
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        vcard("value"),
        sym("tel:1234"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryPhoneNumbers();
      expect(result).toEqual([]);
    });

    it("returns an empty array if hasTelephone node and value are unrelated", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasTelephone"),
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#other"),
        vcard("value"),
        sym("tel:1234"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryPhoneNumbers();
      expect(result).toEqual([]);
    });

    it("ignores phone numbers that are not a named node", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasTelephone"),
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        vcard("value"),
        lit("1234"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryPhoneNumbers();
      expect(result).toEqual([]);
    });

    it("ignores phone numbers that are not a tel: URI", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasTelephone"),
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        vcard("value"),
        sym("https://bob.phone.test"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryPhoneNumbers();
      expect(result).toEqual([]);
    });

    it("returns a single plain phone number without tel prefix", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasTelephone"),
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        vcard("value"),
        sym("tel:1234"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryPhoneNumbers();
      expect(result).toEqual([
        {
          uri: "https://pod.test/alice/contact/1/index.ttl#phone",
          value: "1234",
        },
      ]);
    });

    it("returns all available phone numbers", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasTelephone"),
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
        vcard("hasTelephone"),
        sym("https://pod.test/alice/contact/1/index.ttl#phone2"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#phone"),
        vcard("value"),
        sym("tel:1234"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      store.add(
        sym("https://pod.test/alice/contact/1/index.ttl#phone2"),
        vcard("value"),
        sym("tel:5678"),
        sym("https://pod.test/alice/contact/1/index.ttl"),
      );
      const query = new ContactQuery(
        store,
        sym("https://pod.test/alice/contact/1/index.ttl#this"),
      );
      const result = query.queryPhoneNumbers();
      expect(result).toEqual([
        {
          uri: "https://pod.test/alice/contact/1/index.ttl#phone",
          value: "1234",
        },
        {
          uri: "https://pod.test/alice/contact/1/index.ttl#phone2",
          value: "5678",
        },
      ]);
    });
  });
});
