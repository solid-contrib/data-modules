import { createBookmarkWithinContainer } from "./createBookmarkWithinContainer";

import { when } from "jest-when";
import { lit, st, sym } from "rdflib";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import { rdf } from "@solid-data-modules/rdflib-utils";
import { bookm, dct, xsd } from "../namespaces";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

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
        rdf("type"),
        bookm("Bookmark"),
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
        dct("title"),
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
        bookm("recalls"),
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
        dct("created"),
        lit("2024-01-02T03:04:05.123Z", undefined, xsd("dateTime")),
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
