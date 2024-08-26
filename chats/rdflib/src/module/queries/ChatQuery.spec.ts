import { ChatQuery } from "./ChatQuery";
import { graph, sym } from "rdflib";
import { dc } from "../namespaces";

describe(ChatQuery.name, () => {
  describe("queryTitle", () => {
    it("returns empty string if store is empty", () => {
      const store = graph();
      const chatNode = sym("https://pod.test/chats/1#this");
      const query = new ChatQuery(chatNode, store);
      expect(query.queryTitle()).toEqual("");
    });

    it("returns the dc:title", () => {
      const store = graph();
      const chatNode = sym("https://pod.test/chats/1#this");
      store.add(chatNode, dc("title"), "Some chat", chatNode.doc());
      const query = new ChatQuery(chatNode, store);
      expect(query.queryTitle()).toEqual("Some chat");
    });

    it("returns empty string if title is in wrong document", () => {
      const store = graph();
      const chatNode = sym("https://pod.test/chats/1#this");
      store.add(
        chatNode,
        dc("title"),
        "Some chat",
        sym("https://pod.test/chats/wrong"),
      );
      const query = new ChatQuery(chatNode, store);
      expect(query.queryTitle()).toEqual("");
    });
  });
});
