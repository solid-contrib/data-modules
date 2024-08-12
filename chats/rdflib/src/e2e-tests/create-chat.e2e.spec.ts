import { setupModule } from "../test-support/setupModule";

describe("chats", () => {
  it("creates a new chat", () => {
    const chats = setupModule();
    const uri = chats.createChat({
      containerUri: "http://localhost:3456/alice/chats/",
      name: "A new chat"
    })
    expect(uri).toMatch(
      new RegExp("http://localhost:3456/alice/chats/[a-zA-Z0-9]{6}/index.ttl#this"),
    );
  });

});