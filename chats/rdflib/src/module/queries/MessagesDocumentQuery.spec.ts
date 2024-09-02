import { MessagesDocumentQuery } from "./MessagesDocumentQuery";
import { graph, parse, sym } from "rdflib";

describe(MessagesDocumentQuery.name, () => {
  describe("query messages", () => {
    it("returns empty array if store is empty", () => {
      const result = new MessagesDocumentQuery(
        sym("https://pod.example/chat/1/index.ttl#this"),
        sym("https://pod.example/chat/1/2024/07/30/chat.ttl"),
        graph(),
      ).queryMessages();
      expect(result).toEqual([]);
    });

    it("returns the message linked to the chat", () => {
      const store = graph();
      parse(
        `@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .

<https://pod.example/chat/1/index.ttl#this>
    wf:message <#message-1> .

<#message-1>
    <http://rdfs.org/sioc/ns#content>  "A chat message" ;
    <http://purl.org/dc/terms/created> "2024-07-01T17:47:14Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
    <http://xmlns.com/foaf/0.1/maker>  <http://localhost:3000/alice/profile/card#me> ;
. 
      `,
        store,
        "https://pod.example/chat/1/2024/07/30/chat.ttl",
      );

      const result = new MessagesDocumentQuery(
        sym("https://pod.example/chat/1/index.ttl#this"),
        sym("https://pod.example/chat/1/2024/07/30/chat.ttl"),
        store,
      ).queryMessages();
      expect(result).toEqual([
        {
          uri: "https://pod.example/chat/1/2024/07/30/chat.ttl#message-1",
          text: "A chat message",
          date: new Date("2024-07-01T17:47:14Z"),
          authorWebId: "http://localhost:3000/alice/profile/card#me",
        },
      ]);
    });

    it("returns all messages linked to the chat", () => {
      const store = graph();
      parse(
        `@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .

<https://pod.example/chat/1/index.ttl#this>
    wf:message <#message-1>, <#message-2> .

<#message-1>
    <http://rdfs.org/sioc/ns#content>  "First message" ;
    <http://purl.org/dc/terms/created> "2024-07-01T17:47:14Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
    <http://xmlns.com/foaf/0.1/maker>  <http://localhost:3000/alice/profile/card#me> .
    
<#message-2>
    <http://rdfs.org/sioc/ns#content>  "Second message" ;
    <http://purl.org/dc/terms/created> "2024-07-01T17:48:14Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
    <http://xmlns.com/foaf/0.1/maker>  <http://localhost:3000/bob/profile/card#me> ;
. 
      `,
        store,
        "https://pod.example/chat/1/2024/07/30/chat.ttl",
      );

      const result = new MessagesDocumentQuery(
        sym("https://pod.example/chat/1/index.ttl#this"),
        sym("https://pod.example/chat/1/2024/07/30/chat.ttl"),
        store,
      ).queryMessages();
      expect(result).toEqual([
        {
          uri: "https://pod.example/chat/1/2024/07/30/chat.ttl#message-1",
          text: "First message",
          date: new Date("2024-07-01T17:47:14Z"),
          authorWebId: "http://localhost:3000/alice/profile/card#me",
        },
        {
          uri: "https://pod.example/chat/1/2024/07/30/chat.ttl#message-2",
          text: "Second message",
          date: new Date("2024-07-01T17:48:14Z"),
          authorWebId: "http://localhost:3000/bob/profile/card#me",
        },
      ]);
    });

    describe("ignores messages", () => {
      it("that are not linked to the chat", () => {
        const store = graph();
        parse(
          `@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .

<#message-1>
    <http://rdfs.org/sioc/ns#content>  "A chat message" ;
    <http://purl.org/dc/terms/created> "2024-07-01T17:47:14Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
    <http://xmlns.com/foaf/0.1/maker>  <http://localhost:3000/alice/profile/card#me> ;
. 
      `,
          store,
          "https://pod.example/chat/1/2024/07/30/chat.ttl",
        );

        const result = new MessagesDocumentQuery(
          sym("https://pod.example/chat/1/index.ttl#this"),
          sym("https://pod.example/chat/1/2024/07/30/chat.ttl"),
          store,
        ).queryMessages();
        expect(result).toEqual([]);
      });

      it("that are linked to the chat in the wrong document", () => {
        const store = graph();
        parse(
          `@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .

<https://pod.example/chat/1/index.ttl#this>
    wf:message <chat.ttl#message-1> .`,
          store,
          "https://pod.example/chat/1/2024/07/30/wrong.ttl",
        );
        parse(
          `@prefix wf: <http://www.w3.org/2005/01/wf/flow#> .

<#message-1>
    <http://rdfs.org/sioc/ns#content>  "A chat message" ;
    <http://purl.org/dc/terms/created> "2024-07-01T17:47:14Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
    <http://xmlns.com/foaf/0.1/maker>  <http://localhost:3000/alice/profile/card#me> ;
. 
      `,
          store,
          "https://pod.example/chat/1/2024/07/30/chat.ttl",
        );

        const result = new MessagesDocumentQuery(
          sym("https://pod.example/chat/1/index.ttl#this"),
          sym("https://pod.example/chat/1/2024/07/30/chat.ttl"),
          store,
        ).queryMessages();
        expect(result).toEqual([]);
      });
    });
  });
});
