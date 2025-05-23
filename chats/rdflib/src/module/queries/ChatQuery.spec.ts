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

  describe("query container", () => {
    it("returns the container of the chat document", () => {
      const chatNode = sym("https://pod.test/chats/1#this");
      const query = new ChatQuery(chatNode, graph());
      const container = query.queryContainer();
      expect(container).toEqual(sym("https://pod.test/chats/"));
    });

    it("throws an error if no container can be determined", () => {
      const chatNode = sym("https://pod.test/");
      const query = new ChatQuery(chatNode, graph());
      expect(() => query.queryContainer()).toThrow(
        new Error("The chat node https://pod.test/ has no parent container"),
      );
    });
  });
});
