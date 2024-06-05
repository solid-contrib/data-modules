import { BookmarksModuleRdfLib } from "./module/BookmarksModuleRdfLib.js";

export default BookmarksModuleRdfLib;

/**
 * Data needed to create a new bookmark within a container
 */
export interface CreateBookmarkInContainerCommand {
  /**
   * The URI of the target container
   */
  containerUri: string;
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
  createBookmark({
    containerUri,
    title,
    url,
  }: CreateBookmarkInContainerCommand): Promise<string>;
}
