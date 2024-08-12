import { createChat } from "./create-chat";
import { lit, st, sym } from "rdflib";
import { rdf } from "@solid-data-modules/rdflib-utils";
import { dc, meeting } from "../namespaces";

describe(createChat.name, () => {
  it("inserts the LongChat type to the chat document", () => {
    const { insertions } = createChat(
      "http://pod.test/chat/index.ttl#this",
      "irrelevant",
    );
    expect(insertions).toContainEqual(
      st(
        sym("http://pod.test/chat/index.ttl#this"),
        rdf("type"),
        meeting("LongChat"),
        sym("http://pod.test/chat/index.ttl"),
      ),
    );
  });
  it("inserts the name type to the chat document", () => {
    const { insertions } = createChat(
      "http://pod.test/chat/index.ttl#this",
      "chat name",
    );
    expect(insertions).toContainEqual(
      st(
        sym("http://pod.test/chat/index.ttl#this"),
        dc("title"),
        lit("chat name"),
        sym("http://pod.test/chat/index.ttl"),
      ),
    );
  });
});
