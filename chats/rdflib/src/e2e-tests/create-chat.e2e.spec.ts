import { setupModule } from "../test-support/setupModule";

describe("chats", () => {
  it("module can be created", () => {
    const chats = setupModule();
    expect(chats).toBeDefined()
  });
});