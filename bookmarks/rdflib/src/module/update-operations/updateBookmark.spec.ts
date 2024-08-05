import { updateBookmark } from "./updateBookmark";
import { graph, lit, st, sym } from "rdflib";
import { bookm, dct } from "../namespaces";

describe(updateBookmark.name, () => {
  it("inserts the new title to the document", () => {
    const store = graph();
    const result = updateBookmark(
      store,
      sym("https://pod.example/bookmark#it"),
      "new title",
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://pod.example/bookmark#it"),
        dct("title"),
        lit("new title"),
        sym("https://pod.example/bookmark"),
      ),
    );
  });

  it("inserts the new url to the document", () => {
    const store = graph();
    const result = updateBookmark(
      store,
      sym("https://pod.example/bookmark#it"),
      undefined,
      "https://new.url.test",
    );
    expect(result.insertions).toContainEqual(
      st(
        sym("https://pod.example/bookmark#it"),
        bookm("recalls"),
        sym("https://new.url.test"),
        sym("https://pod.example/bookmark"),
      ),
    );
  });

  it("deletes the old title from the document", () => {
    const store = graph();
    store.add(
      sym("https://pod.example/bookmark#it"),
      bookm("recalls"),
      sym("https://old.url.test"),
      sym("https://pod.example/bookmark"),
    );
    const result = updateBookmark(
      store,
      sym("https://pod.example/bookmark#it"),
      "new title",
    );
    expect(result.deletions).toContainEqual(
      st(
        sym("https://pod.example/bookmark#it"),
        bookm("recalls"),
        sym("https://old.url.test"),
        sym("https://pod.example/bookmark"),
      ),
    );
  });

  it("deletes the old url from the document", () => {
    const store = graph();
    store.add(
      sym("https://pod.example/bookmark#it"),
      dct("title"),
      lit("old title"),
      sym("https://pod.example/bookmark"),
    );
    const result = updateBookmark(
      store,
      sym("https://pod.example/bookmark#it"),
      "new title",
    );
    expect(result.deletions).toContainEqual(
      st(
        sym("https://pod.example/bookmark#it"),
        dct("title"),
        lit("old title"),
        sym("https://pod.example/bookmark"),
      ),
    );
  });
});
