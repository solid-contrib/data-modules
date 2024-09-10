import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import { when } from "jest-when";
import { mintMessageUri } from "./mintMessageUri";
import { sym } from "rdflib";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("mintMessageUri", () => {
  it("creates a new URI based on the chat container, the current date and a random ID", () => {
    // given a random ID is generated
    when(generateId).mockReturnValue("qwerty123");

    // and today is this date
    jest.useFakeTimers({
      now: new Date("2024-08-15"),
    });

    // and a chat node

    const chatNode = sym("https://pod.test/chat/123/index.ttl#this");

    // when a URI for a message is minted
    const result = mintMessageUri(chatNode);

    // then
    expect(result).toEqual(
      "https://pod.test/chat/123/2024/08/15/chat.ttl#qwerty123",
    );
  });

  it("fails if chat has no container", () => {
    // given a random ID is generated
    when(generateId).mockReturnValue("qwerty123");

    // and today is this date
    jest.useFakeTimers({
      now: new Date("2024-08-15"),
    });

    // and a chat node
    const chatNode = sym("https://pod.test");

    // when a URI for a message is minted
    expect(() => mintMessageUri(chatNode)).toThrow(
      new Error("Chat https://pod.test has no container"),
    );
  });
});
