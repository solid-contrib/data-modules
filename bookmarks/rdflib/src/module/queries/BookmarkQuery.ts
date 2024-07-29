import { IndexedFormula, NamedNode } from "rdflib";
import { bookm, dct } from "../namespaces.js";
import { rdf } from "@solid-data-modules/rdflib-utils";
import { Bookmark } from "../../index.js";

export class BookmarkQuery {
  constructor(
    private bookmarkDoc: NamedNode,
    private store: IndexedFormula,
  ) {}

  queryBookmarks(): Bookmark[] {
    const bookmarks = this.store.each(
      undefined,
      rdf("type"),
      bookm("Bookmark"),
      this.bookmarkDoc,
    );
    return bookmarks
      .map((it) => it as NamedNode)
      .map((it) => {
        const title = this.store.anyValue(
          it,
          dct("title"),
          undefined,
          this.bookmarkDoc,
        );
        if (!title) return null;
        const bookmarkedUrl = this.store.anyValue(
          it,
          bookm("recalls"),
          undefined,
          this.bookmarkDoc,
        );
        if (!bookmarkedUrl) return null;
        return {
          uri: it.uri,
          title,
          bookmarkedUrl: bookmarkedUrl,
        };
      })
      .filter(nonNull);
  }
}

function nonNull<T>(value: T | null): value is T {
  return value !== null;
}
