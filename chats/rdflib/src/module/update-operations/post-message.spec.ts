import { postMessage } from "./post-message";
import { st, sym } from "rdflib";
import { wf } from "../namespaces";

describe("post message", () => {
  it("inserts a link from chat to message", () => {
    const result = postMessage(
      "https://pod.test/chat/42/chat.ttl#1",
      sym("https://pod.test/chat/42/index.ttl#this"),
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://pod.test/chat/42/index.ttl#this"),
        wf("message"),
        sym("https://pod.test/chat/42/chat.ttl#1"),
        sym("https://pod.test/chat/42/chat.ttl"),
      ),
    );
  });
});
