import { setupModule } from "../test-support/setupModule.js";

describe("update bookmark", () => {
  it("updates the title and bookmarked url", async () => {
    const bookmarks = setupModule();

    // given a storage containing an old bookmark
    const oldList = await bookmarks.listBookmarks(
      "http://localhost:3456/public/edit-bookmarks",
    );
    expect(oldList).toContainEqual({
      uri: "http://localhost:3456/public/edit-bookmarks#6c0b5b5d",
      title: "Old title",
      bookmarkedUrl: "https://old-site.example",
    });

    // when the bookmark title and url are updated
    await bookmarks.updateBookmark({
      uri: "http://localhost:3456/public/edit-bookmarks#6c0b5b5d",
      newTitle: "New title",
      newUrl: "https://new-site.example",
    });

    // then the storage lists the bookmarks with the updated values
    const newList = await bookmarks.listBookmarks(
      "http://localhost:3456/public/edit-bookmarks",
    );
    expect(newList).toContainEqual({
      uri: "http://localhost:3456/public/edit-bookmarks#6c0b5b5d",
      title: "New title",
      bookmarkedUrl: "https://new-site.example",
    });

    // and the old values are gone
    expect(newList).not.toContainEqual({
      uri: "http://localhost:3456/public/edit-bookmarks#6c0b5b5d",
      title: "Old title",
      bookmarkedUrl: "https://old-site.example",
    });
  });

  it("delete a bookmark", async () => {
    const bookmarks = setupModule();

    // given a storage containing a bookmark
    const oldList = await bookmarks.listBookmarks(
      "http://localhost:3456/public/edit-bookmarks",
    );
    expect(oldList).toContainEqual({
      uri: "http://localhost:3456/public/edit-bookmarks#eb282827",
      title: "Delete me",
      bookmarkedUrl: "https://soon-gone.example",
    });

    // when the bookmark is deleted
    await bookmarks.deleteBookmark(
      "http://localhost:3456/public/edit-bookmarks#eb282827",
    );

    // then the storage does not contain this bookmark anymore
    const newList = await bookmarks.listBookmarks(
      "http://localhost:3456/public/edit-bookmarks",
    );

    // and the old values are gone
    expect(newList).not.toContainEqual(
      expect.objectContaining({
        uri: "http://localhost:3456/public/edit-bookmarks#eb282827",
      }),
    );
  });
});
