import { setupModule } from "../../test-support/setupModule";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import { when } from "jest-when";
import { mockTurtleDocument } from "@solid-data-modules/rdflib-utils/test-support";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("post message", () => {
  it("creates the message in a document for the current date and returns the minted URI", async () => {
    // given a random ID is generated
    when(generateId).mockReturnValue("8c615b");

    // and today is a specific date
    jest.useFakeTimers({
      now: new Date("2024-07-30"),
    });

    // and a chats module
    const authenticatedFetch = jest.fn();
    const chats = setupModule(authenticatedFetch);

    // and an existing chat document
    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/alice/chats/abc123/index.ttl",
      `
      <#this> a <http://www.w3.org/ns/pim/meeting#LongChat>;
    <http://purl.org/dc/elements/1.1/title> "An existing chat channel".
        `,
    );

    // when a message is posted to the chat
    const uri = await chats.postMessage({
      chatUri: "https://pod.test/alice/chats/abc123/index.ttl#this",
      text: "A new message",
      authorWebId: "https://pod.test/alice/profile/card#me",
    });

    // then the minted URI is returned
    expect(uri).toMatch(
      new RegExp(
        "https://pod.test/alice/chats/abc123/2024/07/30/chat.ttl#8c615b",
      ),
    );
  });
});
