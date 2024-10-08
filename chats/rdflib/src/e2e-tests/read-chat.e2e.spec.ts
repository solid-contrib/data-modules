import { setupModule } from "../test-support/setupModule";

describe("read a chat", () => {
  it("retrieves the chat name", async () => {
    const chats = setupModule();

    const chat = await chats.readChat(
      "http://localhost:3456/chats/eBIszJ/index.ttl#this",
    );

    expect(chat.uri).toEqual(
      "http://localhost:3456/chats/eBIszJ/index.ttl#this",
    );
    expect(chat.name).toEqual("An existing chat channel");
  });

  it("retrieves the latest messages", async () => {
    const chats = setupModule();

    const chat = await chats.readChat(
      "http://localhost:3456/chats/eBIszJ/index.ttl#this",
    );

    expect(chat.uri).toEqual(
      "http://localhost:3456/chats/eBIszJ/index.ttl#this",
    );
    expect(chat.latestMessages).toEqual([
      {
        uri: "http://localhost:3456/chats/eBIszJ/2024/07/01/chat.ttl#Msg1723225634153",
        text: "Hello visitor, welcome to my public chat lobby!",
        date: new Date("2024-07-01T17:47:14Z"),
        authorWebId: "http://localhost:3000/alice/profile/card#me",
      },
      {
        uri: "http://localhost:3456/chats/eBIszJ/2024/07/01/chat.ttl#Msg1723225634154",
        text: "Let me know, if you need anything.",
        date: new Date("2024-07-01T17:48:24Z"),
        authorWebId: "http://localhost:3000/alice/profile/card#me",
      },
    ]);
  });
});
