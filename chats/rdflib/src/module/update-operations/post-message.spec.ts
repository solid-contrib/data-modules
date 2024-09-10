import { postMessage } from "./post-message";
import { lit, st, sym } from "rdflib";
import { dct, foaf, sioc, wf } from "../namespaces";

describe("post message", () => {
  it("inserts a link from chat to message", () => {
    const result = postMessage(
      "https://pod.test/chat/42/chat.ttl#message-1",
      "irrelevant",
      "https://pod.test/irrelevant",
      sym("https://pod.test/chat/42/index.ttl#this"),
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://pod.test/chat/42/index.ttl#this"),
        wf("message"),
        sym("https://pod.test/chat/42/chat.ttl#message-1"),
        sym("https://pod.test/chat/42/chat.ttl"),
      ),
    );
  });

  it("inserts the message content", () => {
    const result = postMessage(
      "https://pod.test/chat/42/chat.ttl#message-1",
      "the text to insert",
      "https://pos.test/irrelevant",
      sym("https://pod.test/chat/42/index.ttl#this"),
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://pod.test/chat/42/chat.ttl#message-1"),
        sioc("content"),
        lit("the text to insert"),
        sym("https://pod.test/chat/42/chat.ttl"),
      ),
    );
  });

  it("inserts the current time as creation date", () => {
    jest.useFakeTimers({
      now: new Date("2024-09-08T07:06:05.432Z"),
    });
    const result = postMessage(
      "https://pod.test/chat/42/chat.ttl#message-1",
      "irrelevant",
      "https://pos.test/irrelevant",
      sym("https://pod.test/chat/42/index.ttl#this"),
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://pod.test/chat/42/chat.ttl#message-1"),
        dct("created"),
        lit(
          "2024-09-08T07:06:05.432Z",
          undefined,
          sym("http://www.w3.org/2001/XMLSchema#dateTime"),
        ),
        sym("https://pod.test/chat/42/chat.ttl"),
      ),
    );
  });

  it("inserts the author WebID", () => {
    const result = postMessage(
      "https://pod.test/chat/42/chat.ttl#message-1",
      "irrelevant",
      "https://pos.test/alice/profile/card#me",
      sym("https://pod.test/chat/42/index.ttl#this"),
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://pod.test/chat/42/chat.ttl#message-1"),
        foaf("maker"),
        sym("https://pos.test/alice/profile/card#me"),
        sym("https://pod.test/chat/42/chat.ttl"),
      ),
    );
  });
});
