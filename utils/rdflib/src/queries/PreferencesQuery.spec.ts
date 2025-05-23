import { graph, lit, sym } from "rdflib";
import { solid } from "../namespaces";
import { PreferencesQuery } from "./PreferencesQuery";

describe("PreferencesQuery", () => {
  describe("query private type index", () => {
    it("returns null if store is empty", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      const preferencesDoc = sym("https://pod.test/alice/settings/prefs.ttl");
      const query = new PreferencesQuery(store, webIdNode, preferencesDoc);
      const result = query.queryPrivateTypeIndex();
      expect(result).toBeNull();
    });

    it("returns node of private type index", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      const preferencesDoc = sym("https://pod.test/alice/settings/prefs.ttl");
      store.add(
        webIdNode,
        solid("privateTypeIndex"),
        sym("https://pod.test/alice/settings/privateTypeIndex.ttl"),
        preferencesDoc.doc(),
      );
      const query = new PreferencesQuery(store, webIdNode, preferencesDoc);
      const result = query.queryPrivateTypeIndex();
      expect(result).toEqual(
        sym("https://pod.test/alice/settings/privateTypeIndex.ttl"),
      );
    });

    it("returns null if value is not a named node", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      const preferencesDoc = sym("https://pod.test/alice/settings/prefs.ttl");
      store.add(
        webIdNode,
        solid("privateTypeIndex"),
        lit("https://pod.test/alice/settings/privateTypeIndex.ttl"),
        webIdNode.doc(),
      );
      const query = new PreferencesQuery(store, webIdNode, preferencesDoc);
      const result = query.queryPrivateTypeIndex();
      expect(result).toBeNull();
    });

    it("returns null if statement is in the wrong document", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      const preferencesDoc = sym("https://pod.test/alice/settings/prefs.ttl");
      store.add(
        webIdNode,
        solid("privateTypeIndex"),
        sym("https://pod.test/alice/settings/privateTypeIndex.ttl"),
        sym("https://pod.test/alice/wrong.ttl"),
      );
      const query = new PreferencesQuery(store, webIdNode, preferencesDoc);
      const result = query.queryPrivateTypeIndex();
      expect(result).toBeNull();
    });
  });
});
