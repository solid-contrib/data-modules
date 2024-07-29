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
        const bookmarkedUrl = this.store.anyValue(
          it,
          bookm("recalls"),
          undefined,
          this.bookmarkDoc,
        );
        return {
          uri: it.uri,
          title: title ?? "",
          bookmarkedUrl: bookmarkedUrl ?? "",
        };
      });
  }
}
