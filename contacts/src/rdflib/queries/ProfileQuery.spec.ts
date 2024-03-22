import { graph, lit, sym } from "rdflib";
import { ProfileQuery } from "./ProfileQuery";
import { pim, solid } from "../namespaces";

describe("ProfileQuery", () => {
  describe("query public type index", () => {
    it("returns null if store is empty", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      const query = new ProfileQuery(webIdNode, store);
      const result = query.queryPublicTypeIndex();
      expect(result).toBeNull();
    });

    it("returns node of public type index", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      store.add(
        webIdNode,
        solid("publicTypeIndex"),
        sym("https://pod.test/alice/settings/publicTypeIndex.ttl"),
        webIdNode.doc(),
      );
      const query = new ProfileQuery(webIdNode, store);
      const result = query.queryPublicTypeIndex();
      expect(result).toEqual(
        sym("https://pod.test/alice/settings/publicTypeIndex.ttl"),
      );
    });

    it("returns null if value is not a named node", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      store.add(
        webIdNode,
        solid("publicTypeIndex"),
        lit("https://pod.test/alice/settings/publicTypeIndex.ttl"),
        webIdNode.doc(),
      );
      const query = new ProfileQuery(webIdNode, store);
      const result = query.queryPublicTypeIndex();
      expect(result).toBeNull();
    });

    it("returns null if statement is in the wrong document", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      store.add(
        webIdNode,
        solid("publicTypeIndex"),
        sym("https://pod.test/alice/settings/publicTypeIndex.ttl"),
        sym("https://pod.test/alice/wrong.ttl"),
      );
      const query = new ProfileQuery(webIdNode, store);
      const result = query.queryPublicTypeIndex();
      expect(result).toBeNull();
    });
  });

  describe("query preferences file", () => {
    it("returns null if store is empty", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      const query = new ProfileQuery(webIdNode, store);
      const result = query.queryPreferencesFile();
      expect(result).toBeNull();
    });

    it("returns node of preferences file", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      store.add(
        webIdNode,
        pim("preferencesFile"),
        sym("https://pod.test/alice/settings/prefs.ttl"),
        webIdNode.doc(),
      );
      const query = new ProfileQuery(webIdNode, store);
      const result = query.queryPreferencesFile();
      expect(result).toEqual(sym("https://pod.test/alice/settings/prefs.ttl"));
    });

    it("returns null if value is not a named node", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      store.add(
        webIdNode,
        pim("preferencesFile"),
        lit("https://pod.test/alice/settings/prefs.ttl"),
        webIdNode.doc(),
      );
      const query = new ProfileQuery(webIdNode, store);
      const result = query.queryPreferencesFile();
      expect(result).toBeNull();
    });

    it("returns null if statement is in the wrong document", () => {
      const store = graph();
      const webIdNode = sym("https://pod.test/alice/profile/card#me");
      store.add(
        webIdNode,
        pim("preferencesFile"),
        sym("https://pod.test/alice/settings/prefs.ttl"),
        sym("https://pod.test/alice/wrong.ttl"),
      );
      const query = new ProfileQuery(webIdNode, store);
      const result = query.queryPreferencesFile();
      expect(result).toBeNull();
    });
  });
});
