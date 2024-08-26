import { setupModule } from "../test-support/setupModule";

describe("chats", () => {
  it("read a chat", async () => {
    const chats = setupModule();

    const chat = await chats.readChat(
      "http://localhost:3456/chats/eBIszJ/index.ttl#this",
    );

    expect(chat.uri).toEqual(
      "http://localhost:3456/chats/eBIszJ/index.ttl#this",
    );
    expect(chat.name).toEqual("An existing chat channel");
  });
});
