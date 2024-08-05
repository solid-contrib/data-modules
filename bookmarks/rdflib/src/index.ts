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
 * Data needed to update a bookmark
 */
export interface UpdateBookmarkCommand {
  /**
   * The URI of the bookmark resource to update
   */
  uri: string;

  /**
   * The new human-readable title of the bookmark
   */
  newTitle: string | undefined;
  /**
   * The new URL the bookmark refers to
   */
  newUrl: string | undefined;
}

/**
 * Object describing potential storage locations for bookmarks.
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

/**
 * A bookmark stored in a Pod
 */
export interface Bookmark {
  /**
   * ID of the bookmark
   */
  uri: string;
  /**
   * The human-readable title of the bookmark
   */
  title: string;
  /**
   * The URL the bookmark refers to
   */
  bookmarkedUrl: string;
}

export interface BookmarksModule {
  /**
   * Discover configured storages for Bookmarks (containers and/or documents) from private and public type indexes of the given WebID
   * @param webId - The WebID whose indexes to search
   */
  discoverStorage(webId: string): Promise<BookmarkStorage>;

  /**
   * List all bookmarks stored at the given location
   * @param storageUrl - The URL of the container or document to look into for bookmarks
   */
  listBookmarks(storageUrl: string): Promise<Bookmark[]>;

  /**
   * Create a new bookmark at the given storage. Potential storage URLs can be discovered using {@link discoverStorage}.
   * @param command
   */
  createBookmark(command: CreateBookmarkCommand): Promise<string>;

  /**
   * Updates a given bookmark to new values
   * @param command
   */
  updateBookmark(command: UpdateBookmarkCommand): Promise<void>;

  /**
   * Deletes the given bookmark
   * @param bookmarkUri - The URI of the bookmark resource to delete
   */
  deleteBookmark(bookmarkUri: string): Promise<void>;
}
