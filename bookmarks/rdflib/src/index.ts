import { BookmarksModuleRdfLib } from "./module/BookmarksModuleRdfLib.js";

export default BookmarksModuleRdfLib;

/**
 * Data needed to create a new bookmark within a container
 */
export interface CreateBookmarkCommand {
  /**
   * The URL of the target container or document to store the bookmark
   */
  storageUrl: string;
  /**
   * The human-readable title of the bookmark
   */
  title: string;
  /**
   * The URL to bookmark
   */
  url: string;
}

export interface BookmarksModule {
  discoverStorage(webId: string): Promise<BookmarkStorage>;

  createBookmark({
                   storageUrl,
                   title,
                   url
                 }: CreateBookmarkCommand): Promise<string>;
}

export interface BookmarkStorage {
  private: {
    documentUrls: string[],
    containerUrls: string[]
  },
  public: {
    documentUrls: string[],
    containerUrls: string[]
  }
}