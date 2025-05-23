import { setupModule } from "../test-support/setupModule.js";

describe("list bookmarks", () => {
  it("lists all bookmarks in a document", async () => {
    const bookmarks = setupModule();
    const result = await bookmarks.listBookmarks(
      "http://localhost:3456/public/list-bookmarks",
    );
    expect(result).toContainEqual({
      uri: "http://localhost:3456/public/list-bookmarks#fcb771d4",
      title: "First bookmark in a document",
      bookmarkedUrl: "https://first-bookmark.example",
    });
    expect(result).toContainEqual({
      uri: "http://localhost:3456/public/list-bookmarks#180a31e2",
      title: "Second bookmark in a document",
      bookmarkedUrl: "https://second-bookmark.example",
    });
    expect(result).toHaveLength(2);
  });

  it("lists all bookmarks in a container", async () => {
    const bookmarks = setupModule();
    const result = await bookmarks.listBookmarks(
      "http://localhost:3456/list-bookmarks/",
    );
    expect(result).toContainEqual({
      uri: "http://localhost:3456/list-bookmarks/7I6dK9#it",
      title: "Some Bookmark",
      bookmarkedUrl: "https://nice-page.example",
    });
    expect(result).toContainEqual({
      uri: "http://localhost:3456/list-bookmarks/8beCSQ#it",
      title: "Existing bookmark",
      bookmarkedUrl: "https://existing-bookmark.example",
    });
    expect(result).toHaveLength(2);
  });
});
