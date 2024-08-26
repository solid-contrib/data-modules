import { setupModule } from "../../test-support/setupModule";
import {
  mockLdpContainer,
  mockTurtleDocument,
} from "@solid-data-modules/rdflib-utils/test-support";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("read chat", () => {
  it("reads the chat name", async () => {
    // given a chats module
    const authenticatedFetch = jest.fn();
    const chats = setupModule(authenticatedFetch);

    // and an existing chat document with a title for the chat
    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/chats/abc123/index.ttl",
      `
      <#this> a <http://www.w3.org/ns/pim/meeting#LongChat>;
    <http://purl.org/dc/elements/1.1/title> "An existing chat channel".
        `,
    );

    // when a chat is read
    const chat = await chats.readChat(
      "https://pod.test/alice/chats/abc123/index.ttl#this",
    );

    // then the title is retrieved as chat name
    expect(chat.name).toEqual("An existing chat channel");
  });

  it("reads the latest messages", async () => {
    // given a chats module
    const authenticatedFetch = jest.fn();
    const chats = setupModule(authenticatedFetch);

    // and an existing chat with a single message in a YYYY/MM/DD container hierarchy
    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/chats/abc123/index.ttl",
      `
      <#this> a <http://www.w3.org/ns/pim/meeting#LongChat>;
    <http://purl.org/dc/elements/1.1/title> "An existing chat channel".
        `,
    );

    mockLdpContainer(
      authenticatedFetch,
      "https://pod.test/alice/chats/abc123/",
      ["https://pod.test/alice/chats/abc123/2024/"],
    );

    mockLdpContainer(
      authenticatedFetch,
      "https://pod.test/alice/chats/abc123/2024/",
      ["https://pod.test/alice/chats/abc123/2024/07/"],
    );

    mockLdpContainer(
      authenticatedFetch,
      "https://pod.test/alice/chats/abc123/2024/07/",
      ["https://pod.test/alice/chats/abc123/2024/07/01/"],
    );

    mockLdpContainer(
      authenticatedFetch,
      "https://pod.test/alice/chats/abc123/2024/07/01/",
      ["https://pod.test/alice/chats/abc123/2024/07/01/chat.ttl"],
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/chats/abc123/2024/07/01/chat.ttl",
      `<https://pod.test/alice/chats/abc123/index.ttl#this>
    <http://www.w3.org/2005/01/wf/flow#message> <#Msg1723225634153> .

<#Msg1723225634153>
    <http://rdfs.org/sioc/ns#content>  "Hello visitor, welcome to my public chat lobby!" ;
    <http://purl.org/dc/terms/created> "2024-07-01T17:47:14Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
    <http://xmlns.com/foaf/0.1/maker>  <http://localhost:3000/alice/profile/card#me> .
        `,
    );

    // when a chat is read
    const chat = await chats.readChat(
      "https://pod.test/alice/chats/abc123/index.ttl#this",
    );

    // then the message is part of the latest messages
    expect(chat.latestMessages).toEqual([
      {
        authorWebId: "http://localhost:3000/alice/profile/card#me",
        date: new Date("2024-07-01T17:47:14Z"),
        text: "Hello visitor, welcome to my public chat lobby!",
      },
    ]);
  });
});
