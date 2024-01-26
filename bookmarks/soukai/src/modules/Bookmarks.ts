import { BOOKMARK, DCTERMS, FOAF, RDFS } from "@inrupt/vocab-common-rdf";
import { TypeIndexHelper } from "@rezasoltani/solid-typeindex-support";
import { FieldType } from "soukai";
import {
  SolidModel,
  defineSolidModelSchema
} from "soukai-solid";
import {
  GetInstanceArgs, ISoukaiDocumentBase,
  urlParentDirectory
} from "soukai-solid-utils";
import { __Bookmark, __DC_UPDATED, __crdt_createdAt, __crdt_updatedAt } from "../constants";
import { isValidUrl } from "../utils";


/**
 * Interface for the required fields to create a new Bookmark instance.
 */
export type ICreateBookmark = {
  title: string;
  topic?: string;
  link: string;
  creator?: string;
};

/**
 * Interface for the shape of a bookmark object that can be updated.
 * Contains title, topic, link, and creator fields.
 */
export type IUpdateBookmark = {
  title: string;
  topic?: string;
  link: string;
  creator?: string;
};

/**
 * Interface for a Bookmark object that extends ISoukaiDocumentBase
 * and includes the required fields to create a new Bookmark instance
 * from ICreateBookmark.
 */
export type IBookmark = ISoukaiDocumentBase & ICreateBookmark & {
  created?: string;
  updated?: string;
};

/**
 * Defines the Solid Model schema for Bookmarks.
 * Includes fields for topic, label, link, createdAt, and updatedAt.
 * Sets the rdf contexts and rdfs classes.
 */

export const BookmarkSchema = defineSolidModelSchema({
  rdfContexts: {
    "bk": BOOKMARK.NAMESPACE,
    "rdfs": RDFS.NAMESPACE,
    "dcterms": DCTERMS.NAMESPACE,
    "foaf": FOAF.NAMESPACE,
  },

  rdfsClasses: [BOOKMARK.Bookmark],

  timestamps: false,

  fields: {
    title: {
      required: true,
      type: FieldType.String,
      rdfProperty: DCTERMS.title,
      rdfPropertyAliases: [RDFS.label],
    },
    link: {
      required: true,
      type: FieldType.Key,
      rdfProperty: BOOKMARK.recalls,
    },
    topic: {
      type: FieldType.Key,
      rdfProperty: BOOKMARK.hasTopic,
    },
    creator: {
      type: FieldType.Key,
      rdfProperty: DCTERMS.creator,
      rdfPropertyAliases: [FOAF.maker],
    },
    created: {
      type: FieldType.Date,
      rdfProperty: DCTERMS.created,
      rdfPropertyAliases: [__crdt_createdAt],
    },
    updated: {
      type: FieldType.Date,
      rdfProperty: __DC_UPDATED,
      rdfPropertyAliases: [__crdt_updatedAt],
    },
  },
});

/**
 * Exports the Bookmark class which extends the BookmarkSchema interface.
 * This allows creating Bookmark instances with the required fields defined in BookmarkSchema.
 */
export class Bookmark extends BookmarkSchema { }

/**
 * BookmarkFactory class that provides factory methods for creating and managing Bookmark instances.
 */
export class BookmarkFactory {
  private static instance: BookmarkFactory;

  private constructor(
    private containerUrls: string[] = [],
    private instancesUrls: string[] = []
  ) { }


  /**
   * Gets an instance of the BookmarkFactory class, which provides methods
   * for creating and managing Bookmark instances.
   *
   * Checks if an instance already exists and returns it. If not, it creates
   * a new instance by:
   *
   * @param webId - The webId of the user.
   * @param fetch - The fetch function to use for requests.
   * @param isPrivate - Whether the user's type index is private or public.
   * @param defaultContainerUrl - The default container url to use if none exist.
   * @returns a Promise resolving to the BookmarkFactory instance.
  */
  public static async getInstance(
    args?: GetInstanceArgs,
    defaultContainerUrl?: string
  ): Promise<BookmarkFactory> {
    if (!BookmarkFactory.instance) {

      const { instanceContainers, instances } = await TypeIndexHelper.getFromTypeIndex(args?.webId!, __Bookmark, fetch, true)

      if (!!instances.length || !!instanceContainers.length) {
        const instanceParents = instances.map(x => urlParentDirectory(x)) as string[]

        const _containers = [...new Set([...instanceContainers, ...instanceParents])]

        BookmarkFactory.instance = new BookmarkFactory(_containers, []);
      } else {
        const podToUse = args?.webId.split("profile")[0];

        const baseURL = podToUse ? podToUse : args?.webId?.split("/profile")[0]

        defaultContainerUrl = `${baseURL}${defaultContainerUrl ?? "bookmarks/"}`;

        await TypeIndexHelper.registerInTypeIndex(args?.webId!, "bookmarks_registry", Bookmark.rdfsClasses[0], fetch, defaultContainerUrl, true, true)

        BookmarkFactory.instance = new BookmarkFactory([defaultContainerUrl], []);
      }
    }
    return BookmarkFactory.instance;
  }

  /**
   * Retrieves all Bookmark instances from the configured containerUrls and instancesUrls.
   *
   * Makes a request to each configured containerUrl and instancesUrl to get all Bookmark instances.
   * Combines and flattens the results into a single array.
   *
   * Returns the array of Bookmark instances.
   */
  async getAll() {
    const containerPromises = this.containerUrls.map((c) =>
      Bookmark.from(c).all()
    );

    const allPromise = Promise.all([
      ...containerPromises,
    ]);

    try {
      const values = (await allPromise).flat();
      return values;
    } catch (error) {
      console.log(error);
      return [] as (Bookmark & SolidModel)[];
    }
  }

  /**
   * Retrieves a Bookmark instance by its url.
   *
   * @param url - The url of the Bookmark to retrieve.
   * @returns The Bookmark instance if found, otherwise throws error.
   */
  async get(url: string) {
    try {
      return await Bookmark.findOrFail(url);
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Creates a new Bookmark instance with the given payload.
   * Generates a UUID for the id, sets the url to the first configured containerUrl + id,
   * and saves the new Bookmark instance.
   *
   * @param payload - The data for the new Bookmark.
   * @returns The saved Bookmark instance .
   */
  async create(payload: ICreateBookmark) {
    const { link, creator } = payload;
    if (!isValidUrl(link)) throw new Error("link is not a valid URL");
    if (creator && !isValidUrl(creator)) throw new Error("creator is not a valid URL");

    const bookmark = new Bookmark({
      ...payload,
      created: new Date(),
      updated: new Date(),
    });
    try {
      return await bookmark.save(this.containerUrls[0]);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  /**
   * Updates an existing Bookmark instance identified by its url.
   *
   * @param url - The url of the Bookmark to update.
   * @param payload - The data to update the Bookmark with.
   * @returns The updated Bookmark instance if successful, otherwise undefined.
   */
  async update(url: string, payload: IBookmark) {
    const { link, creator } = payload;
    if (!isValidUrl(link)) throw new Error("link is not a valid URL");
    if (creator && !isValidUrl(creator)) throw new Error("creator is not a valid URL");

    try {
      const res = await Bookmark.findOrFail(url);
      return await res.update({
        ...payload,
        updated: new Date(),
      });
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  /**
   * Removes a Bookmark instance identified by its url.
   *
   * @param url - The url of the Bookmark to remove.
   * @returns A Promise resolving to the deleted Bookmark instance if successful, otherwise undefined.
   */
  async remove(url: string) {
    try {
      const res = await Bookmark.findOrFail(url);
      return await res.delete();
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}