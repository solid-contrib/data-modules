import { deleteBookmark } from "./deleteBookmark";
import { graph, lit, st, sym } from "rdflib";

describe(deleteBookmark.name, () => {
  it("deletes any statement about the bookmark from the bookmark document", () => {
    const store = graph();
    store.add(
      sym("https://pod.test/bookmarks#1"),
      sym("https://vocab.test/anything"),
      lit("any value"),
      sym("https://pod.test/bookmarks"),
    );
    const result = deleteBookmark(store, sym("https://pod.test/bookmarks#1"));
    expect(result.deletions).toEqual([
      st(
        sym("https://pod.test/bookmarks#1"),
        sym("https://vocab.test/anything"),
        lit("any value"),
        sym("https://pod.test/bookmarks"),
      ),
    ]);
  });

  it("does not delete statements about other bookmarks", () => {
    const store = graph();
    store.add(
      sym("https://pod.test/bookmarks#1"),
      sym("https://vocab.test/anything"),
      lit("any value"),
      sym("https://pod.test/bookmarks"),
    );
    const result = deleteBookmark(store, sym("https://pod.test/bookmarks#2"));
    expect(result.deletions).toEqual([]);
  });

  it("does not delete statements about the bookmark from other documents", () => {
    const store = graph();
    store.add(
      sym("https://pod.test/bookmarks#1"),
      sym("https://vocab.test/anything"),
      lit("any value"),
      sym("https://pod.test/other-bookmarks"),
    );
    const result = deleteBookmark(store, sym("https://pod.test/bookmarks#1"));
    expect(result.deletions).toEqual([]);
  });
});
