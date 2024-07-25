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

/**
 * Object describing potential storage locations for bookmarks.
 *
 */
export interface BookmarkStorage {
  /**
   * locations for personal use, not listed publicly
   */
  privateUrls: string[];
  /**
   * Locations that can be discovered by the public
   */
  publicUrls: string[];
}

export interface BookmarksModule {
  /**
   * Discover configured storages for Bookmarks (containers and/or documents) from private and public type indexes of the given WebID
   * @param webId - The WebID whose indexes to search
   */
  discoverStorage(webId: string): Promise<BookmarkStorage>;

  /**
   * Create a new bookmark at the given storage. Potential storage URLs can be discovered using {@link discoverStorage}.
   * @param storageUrl
   * @param title
   * @param url
   */
  createBookmark({
    storageUrl,
    title,
    url,
  }: CreateBookmarkCommand): Promise<string>;
}
