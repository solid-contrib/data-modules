import { graph, IndexedFormula, st, sym } from "rdflib";
import { updateEmailAddress } from "./updateEmailAddress";
import { vcard } from "../namespaces";

describe("updateEmailAddress", () => {
  let store: IndexedFormula;

  describe("old value to new value", () => {
    beforeEach(() => {
      store = graph();
      store.add(
        sym("https://alice.test/contacts/1/email#1"),
        vcard("value"),
        sym("mailto:old@mail.test"),
      );
    });

    it("deletes the old value", () => {
      const result = updateEmailAddress(
        sym("https://alice.test/contacts/1/email#1"),
        "mailto:new@mail.test",
        store,
      );
      expect(result.deletions).toContainEqual(
        st(
          sym("https://alice.test/contacts/1/email#1"),
          vcard("value"),
          sym("mailto:old@mail.test"),
          sym("https://alice.test/contacts/1/email"),
        ),
      );
    });

    it("inserts the new value", () => {
      const result = updateEmailAddress(
        sym("https://alice.test/contacts/1/email#1"),
        "new@mail.test",
        store,
      );
      expect(result.insertions).toContainEqual(
        st(
          sym("https://alice.test/contacts/1/email#1"),
          vcard("value"),
          sym("mailto:new@mail.test"),
          sym("https://alice.test/contacts/1/email"),
        ),
      );
    });
  });

  describe("missing value to new value", () => {
    beforeEach(() => {
      store = graph();
    });
    it("deletes nothing", () => {
      const result = updateEmailAddress(
        sym("https://alice.test/contacts/1/email#1"),
        "mailto:new@mail.test",
        store,
      );
      expect(result.deletions).toEqual([]);
    });
    it("inserts the new value", () => {
      const result = updateEmailAddress(
        sym("https://alice.test/contacts/1/email#1"),
        "new@mail.test",
        store,
      );
      expect(result.insertions).toContainEqual(
        st(
          sym("https://alice.test/contacts/1/email#1"),
          vcard("value"),
          sym("mailto:new@mail.test"),
          sym("https://alice.test/contacts/1/email"),
        ),
      );
    });
  });
});
