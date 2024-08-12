import { setupModule } from "../../test-support/setupModule";

describe("create chat", () => {
  it("module can be created", () => {
    const chats = setupModule();
    expect(chats).toBeDefined()
  });
});