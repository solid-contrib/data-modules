import { setupModule } from "../../test-support/setupModule";
import { mockTurtleDocument } from "@solid-data-modules/rdflib-utils/test-support";

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
});
