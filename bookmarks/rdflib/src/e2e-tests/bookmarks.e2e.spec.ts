import { setupModule } from "../test-support/setupModule.js";

describe("bookmarks", () => {
  it("can create a new bookmark in a container", async () => {
    const bookmarks = setupModule();
    const uri = await bookmarks.createBookmark({
      containerUri: "http://localhost:3456/bookmarks/",
      title: "My favorite website",
      url: "https://favorite.example",
    });
    expect(uri).toMatch(
      new RegExp("http://localhost:3456/bookmarks/[a-zA-Z0-9]{6}#it"),
    );
  });
});
