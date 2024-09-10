import { setupModule } from "../test-support/setupModule";

describe("chats", () => {
  it("post a new message to a chat", async () => {
    const chats = setupModule();
    const chatUri = "http://localhost:3456/chats/QteE42/index.ttl#this";
    const messageUri = await chats.postMessage({
      chatUri,
      text: "Hello, world!",
      authorWebId: "https://localhost:3456/profile/card#me",
    });
    const chat = await chats.readChat(chatUri);
    expect(chat.latestMessages).toContain(
      expect.objectContaining({
        uri: messageUri,
        authorWebId: "https://localhost:3456/profile/card#me",
        text: "Hello, world!",
      }),
    );
  });
});
