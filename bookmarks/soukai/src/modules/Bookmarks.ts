import { FieldType, TimestampField } from "soukai";
import {
  SolidContainer,
  SolidDocument,
  SolidModel,
  defineSolidModelSchema
} from "soukai-solid";
import {
  GetInstanceArgs, ISoukaiDocumentBase,
  getTypeIndexFromProfile,
  createTypeIndex,
  registerInTypeIndex,
} from "soukai-solid-utils";
import { v4 } from "uuid";


/**
 * Interface for the required fields to create a new Bookmark instance.
 */
export type ICreateBookmark = {
  topic: string;
  label: string;
  link: string;
};

/**
 * Interface for a Bookmark object that extends ISoukaiDocumentBase and includes the required fields to create a new Bookmark instance from ICreateBookmark.
 */
export type IBookmark = ISoukaiDocumentBase & ICreateBookmark;

/**
 * Defines the Solid Model schema for Bookmarks.
 * Includes fields for topic, label, link, createdAt, and updatedAt.
 * Sets the rdf contexts and rdfs classes.
 */
export const BookmarkSchema = defineSolidModelSchema({
  rdfContexts: {
    bk: "http://www.w3.org/2002/01/bookmark#",
  },

  rdfsClasses: ["bk:Bookmark"],

  timestamps: [TimestampField.CreatedAt, TimestampField.UpdatedAt],

  fields: {
    topic: {
      type: FieldType.String,
      rdfProperty: "bk:hasTopic",
    },
    label: {
      type: FieldType.String,
      rdfProperty: "rdfs:label",
    },
    link: {
      type: FieldType.Key,
      rdfProperty: "bk:recalls",
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
      try {
        const baseURL = args?.webId.split("profile")[0];

        defaultContainerUrl = `${baseURL}${defaultContainerUrl ?? "bookmarks/"}`;

        let _containerUrls: string[] = [];
        let _instancesUrls: string[] = [];

        const typeIndexUrl = await getTypeIndexFromProfile({
          webId: args?.webId ?? "",
          fetch: args?.fetch,
          typePredicate: args?.isPrivate
            ? "solid:privateTypeIndex"
            : "solid:publicTypeIndex",
        });

        if (typeIndexUrl) {
          const _containers = await SolidContainer.fromTypeIndex(
            typeIndexUrl,
            Bookmark
          );

          if (!_containers || !_containers.length) {
            _containerUrls.push(defaultContainerUrl);

            await registerInTypeIndex({
              forClass: Bookmark.rdfsClasses[0],
              instanceContainer: _containerUrls[0],
              typeIndexUrl: typeIndexUrl,
            });
          } else {
            _containerUrls = [
              ..._containerUrls,
              ..._containers.map((c) => c.url),
            ];
          }

          const _instances = await SolidDocument.fromTypeIndex(
            typeIndexUrl,
            Bookmark
          );

          if (_instances.length) {
            _instancesUrls = [
              ..._instancesUrls,
              ..._instances.map((c) => c.url),
            ];
          }
        } else {
          // Create TypeIndex
          const typeIndexDocument = await createTypeIndex(
            args?.webId ?? "",
            args?.isPrivate ? "private" : "public",
            args?.fetch
          );
          _containerUrls.push(defaultContainerUrl);

          // TODO: it inserts two instances
          await registerInTypeIndex({
            forClass: Bookmark.rdfsClasses[0],
            instanceContainer: _containerUrls[0],
            typeIndexUrl: typeIndexDocument?.url || "",
          });
        }

        BookmarkFactory.instance = new BookmarkFactory(
          _containerUrls,
          _instancesUrls
        );
      } catch (error: any) {
        console.log(error.message);
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
    const instancePromises = this.instancesUrls.map((i) =>
      Bookmark.all({ $in: [i] })
    );

    const allPromise = Promise.all([...containerPromises, ...instancePromises]);

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
    const res = await Bookmark.findOrFail(url);

    return res;
  }

  /**
   * Creates a new Bookmark instance with the given payload.
   * Generates a UUID for the id, sets the url to the first configured containerUrl + id,
   * and saves the new Bookmark instance.
   *
   * @param payload - The data for the new Bookmark.
   * @returns The saved Bookmark instance.
   */
  async create(payload: ICreateBookmark) {
    const id = v4();

    const bookmark = new Bookmark({
      ...payload,
      id: id,
      url: `${this.containerUrls[0]}${id}`,
    });

    // bookmark.url = `${this.containerUrls[0]}${id}#it`

    return await bookmark.save();
  }

  /**
   * Updates an existing Bookmark instance identified by its url.
   *
   * @param url - The url of the Bookmark to update.
   * @param payload - The data to update the Bookmark with.
   * @returns The updated Bookmark instance if successful, otherwise undefined.
   */
  async update(url: string, payload: IBookmark) {
    try {
      const res = await Bookmark.findOrFail(url);
      return await res.update(payload);
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
