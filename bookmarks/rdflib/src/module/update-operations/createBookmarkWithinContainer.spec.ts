import { createBookmarkWithinContainer } from "./createBookmarkWithinContainer";

import { when } from "jest-when";
import { generateId } from "../../generate-id";
import { lit, st, sym } from "rdflib";

jest.mock("../../generate-id");

describe("createBookmarkWithinContainer", () => {
  it("mints a new URI for the bookmark", () => {
    when(generateId).mockReturnValue("abc123");
    const result = createBookmarkWithinContainer(
      "https://alice.test/bookmarks/",
      "irrelevant",
      "https://site.test",
    );
    expect(result.uri).toEqual("https://alice.test/bookmarks/abc123#it");
  });

  it("inserts the type Bookmark", () => {
    when(generateId).mockReturnValue("abc123");
    const result = createBookmarkWithinContainer(
      "https://alice.test/bookmarks/",
      "irrelevant",
      "https://site.test",
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://alice.test/bookmarks/abc123#it"),
        sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        sym("http://www.w3.org/2002/01/bookmark#Bookmark"),
        sym("https://alice.test/bookmarks/abc123"),
      ),
    );
  });

  it("inserts the title of the bookmark", () => {
    when(generateId).mockReturnValue("abc123");
    const result = createBookmarkWithinContainer(
      "https://alice.test/bookmarks/",
      "My favorite website",
      "https://site.test",
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://alice.test/bookmarks/abc123#it"),
        sym("http://purl.org/dc/terms/title"),
        lit("My favorite website"),
        sym("https://alice.test/bookmarks/abc123"),
      ),
    );
  });

  it("inserts the URL of the bookmark", () => {
    when(generateId).mockReturnValue("abc123");
    const result = createBookmarkWithinContainer(
      "https://alice.test/bookmarks/",
      "My favorite website",
      "https://site.test",
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://alice.test/bookmarks/abc123#it"),
        sym("http://www.w3.org/2002/01/bookmark#recalls"),
        sym("https://site.test"),
        sym("https://alice.test/bookmarks/abc123"),
      ),
    );
  });

  it("inserts the current time as creation date", () => {
    when(generateId).mockReturnValue("abc123");
    const now = new Date("2024-01-02T03:04:05.123Z");
    jest.useFakeTimers().setSystemTime(now);
    const result = createBookmarkWithinContainer(
      "https://alice.test/bookmarks/",
      "My favorite website",
      "https://site.test",
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://alice.test/bookmarks/abc123#it"),
        sym("http://purl.org/dc/terms/created"),
        lit(
          "2024-01-02T03:04:05.123Z",
          undefined,
          sym("http://www.w3.org/2001/XMLSchema#dateTime"),
        ),
        sym("https://alice.test/bookmarks/abc123"),
      ),
    );
  });

  it("deletes nothing", () => {
    when(generateId).mockReturnValue("abc123");
    const result = createBookmarkWithinContainer(
      "https://alice.test/bookmarks/",
      "irrelevant",
      "https://site.test",
    );
    expect(result.deletions).toEqual([]);
  });

  it("creates no files", () => {
    when(generateId).mockReturnValue("abc123");
    const result = createBookmarkWithinContainer(
      "https://alice.test/bookmarks/",
      "irrelevant",
      "https://site.test",
    );
    expect(result.filesToCreate).toEqual([]);
  });
});
