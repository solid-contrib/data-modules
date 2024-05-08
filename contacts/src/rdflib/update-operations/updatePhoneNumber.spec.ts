import { graph, IndexedFormula, st, sym } from "rdflib";
import { updatePhoneNumber } from "./updatePhoneNumber";
import { vcard } from "../namespaces";

describe("updatePhoneNumber", () => {
  let store: IndexedFormula;

  describe("old value to new value", () => {
    beforeEach(() => {
      store = graph();
      store.add(
        sym("https://alice.test/contacts/1/phone#1"),
        vcard("value"),
        sym("tel:+1234"),
      );
    });

    it("deletes the old value", () => {
      const result = updatePhoneNumber(
        sym("https://alice.test/contacts/1/phone#1"),
        "+5678",
        store,
      );
      expect(result.deletions).toContainEqual(
        st(
          sym("https://alice.test/contacts/1/phone#1"),
          vcard("value"),
          sym("tel:+1234"),
          sym("https://alice.test/contacts/1/phone"),
        ),
      );
    });

    it("inserts the new value", () => {
      const result = updatePhoneNumber(
        sym("https://alice.test/contacts/1/phone#1"),
        "+5678",
        store,
      );
      expect(result.insertions).toContainEqual(
        st(
          sym("https://alice.test/contacts/1/phone#1"),
          vcard("value"),
          sym("tel:+5678"),
          sym("https://alice.test/contacts/1/phone"),
        ),
      );
    });
  });

  describe("missing value to new value", () => {
    beforeEach(() => {
      store = graph();
    });
    it("deletes nothing", () => {
      const result = updatePhoneNumber(
        sym("https://alice.test/contacts/1/phone#1"),
        "+5678",
        store,
      );
      expect(result.deletions).toEqual([]);
    });
    it("inserts the new value", () => {
      const result = updatePhoneNumber(
        sym("https://alice.test/contacts/1/phone#1"),
        "+5678",
        store,
      );
      expect(result.insertions).toContainEqual(
        st(
          sym("https://alice.test/contacts/1/phone#1"),
          vcard("value"),
          sym("tel:+5678"),
          sym("https://alice.test/contacts/1/phone"),
        ),
      );
    });
  });
});
