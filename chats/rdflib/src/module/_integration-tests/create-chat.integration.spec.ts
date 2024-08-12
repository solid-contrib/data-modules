import { setupModule } from "../../test-support/setupModule";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import { when } from "jest-when";


jest.mock("@solid-data-modules/rdflib-utils/identifier");


describe("create chat", () => {
  it("mints and returns a new URI for the chat", () => {

    when(generateId).mockReturnValue("abc123")
    const chats = setupModule();
    expect(chats).toBeDefined()
    const uri = chats.createChat({
      containerUri: "https://pod.test/alice/chats/",
      name: "A new chat"
    })
    expect(uri).toMatch(
      new RegExp("https://pod.test/alice/chats/abc123/index.ttl#this"),
    );
  });
});