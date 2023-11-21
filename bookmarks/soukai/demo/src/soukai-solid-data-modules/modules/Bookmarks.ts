import {
  createTypeIndex,
  getTypeIndexFromPofile,
  registerInTypeIndex,
} from "@/utils";
import { FieldType, TimestampField } from "soukai";
import {
  Fetch,
  SolidContainer,
  SolidDocument,
  SolidHasManyRelation,
  SolidModel,
  defineSolidModelSchema,
} from "soukai-solid";
import { ISoukaiDocumentBase } from "../shared/contracts";
import { v4 } from "uuid";
export type ICreateBookmark = {
  topic: string;
  label: string;
  link: string;
};

export interface GetInstanceArgs {
  webId: string;
  fetch?: Fetch;
  isPrivate?: boolean;
}

export type IBookmark = ISoukaiDocumentBase & ICreateBookmark;

export const TopicSchema = defineSolidModelSchema({
  rdfContexts: {
    bk: "http://www.w3.org/2002/01/bookmark#",
  },
  rdfsClasses: ["bk:hasTopic"],
  timestamps: false,
});

export class Topic extends TopicSchema {
  // topicRelationship() {
  //   return this.belongsToMany(Bookmark, "topic");
  // }
}

export const BookmarkSchema = defineSolidModelSchema({
  rdfContexts: {
    bk: "http://www.w3.org/2002/01/bookmark#",
  },

  rdfsClasses: ["bk:Bookmark"],

  timestamps: false,

  fields: {
    topic: {
      type: FieldType.Any,
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

export class Bookmark extends BookmarkSchema {
  topicRelationship() {
    return this.hasOne(Topic, "topic");
  }
  // public relatedTopics!: SolidHasManyRelation<Bookmark, Topic, typeof Topic>;
}
// Bookmark
export class BookmarkFactory {
  private static instance: BookmarkFactory;

  private constructor(
    private containerUrls: string[] = [],
    private instancesUrls: string[] = []
  ) {}

  public static async getInstance(
    args?: GetInstanceArgs,
    defaultContainerUrl?: string
  ): Promise<BookmarkFactory> {
    if (!BookmarkFactory.instance) {
      try {
        const baseURL = args?.webId.split("profile")[0]; // https://example.solidcommunity.net/

        defaultContainerUrl = `${baseURL}${
          defaultContainerUrl ?? "bookmarks/"
        }`;

        let _containerUrls: string[] = [];
        let _instancesUrls: string[] = [];

        const typeIndexUrl = await getTypeIndexFromPofile({
          webId: args?.webId ?? "",
          fetch: args?.fetch,
          typePredicate: args?.isPrivate
            ? "solid:privateTypeIndex"
            : "solid:publicTypeIndex",
        });

        if (typeIndexUrl) {
          // const res = await fromTypeIndex(typeIndexUrl, Bookmark)

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
          const typeIndexUrl = await createTypeIndex(
            args?.webId ?? "",
            "private",
            args?.fetch
          );
          _containerUrls.push(defaultContainerUrl);

          // TODO: it inserts two instances
          await registerInTypeIndex({
            forClass: Bookmark.rdfsClasses[0],
            instanceContainer: _containerUrls[0],
            typeIndexUrl: typeIndexUrl,
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

  async getAll() {
    const containerPromises = this.containerUrls.map((c) =>
      Bookmark.from(c).all()
    );
    const instancePromises = this.instancesUrls.map((i) =>
      Bookmark.all({ $in: [i] })
    );

    const allPromise = Promise.all([...containerPromises, ...instancePromises]);

    try {
      console.log(
        "🚀 ~ file: Bookmarks.ts:197 ~ BookmarkFactory ~ getAll ~ await allPromise:",
        await allPromise
      );
      const values = (await allPromise).flat();
      return values;
    } catch (error) {
      console.log(error);
      return [] as (Bookmark & SolidModel)[];
    }
  }

  async get(pk: string) {
    const res = await Bookmark.findOrFail(pk);

    return res;

    // const containerPromises = this.containerUrls.map(c => Bookmark.from(c).find(id))
    // const instancePromises = this.instancesUrls.map(i => Bookmark.all({ $in: [i] }))

    // const allPromise = Promise.all([...containerPromises, ...instancePromises]);
    // try {
    //     const values = (await allPromise).flat();

    //     return values[0]

    // } catch (error) {
    //     console.log(error);
    //     return undefined
    // }
  }

  async create(payload: ICreateBookmark) {
    const id = v4();
    const { topic, ...rest } = payload;
    const bookmark = new Bookmark({
      ...rest,
      // id: id,
      url: `${this.containerUrls[0]}${id}`,
    });

    // bookmark.relatedTopics.create({ topic: "..." });
    bookmark.topicRelationship().create(
      Topic.at("https://solid-dm.solidcommunity.net/bookmarks/").create({
        // url: "https://solid-dm.solidcommunity.net/topics/",
        title: "soukai-solid",
      })
    );
    // .create(new Topic({
    // url: "https://solid-dm.solidcommunity.net/topics/",
    // topic: "soukai-solid",
    // }));
    // bookmark.topic.create({topic:"https://soukai.js.org/guide/defining-models.html#a-word-about-constructors"})
    // bookmark.url = `${this.containerUrls[0]}${id}#it`

    return await bookmark.save();
  }

  async update(pk: string, payload: IBookmark) {
    try {
      const res = await Bookmark.findOrFail(pk);
      return await res.update(payload);
    } catch (error) {
      console.log(error);
      return undefined;
    }

    // const promises = this.containerUrls.map(c => Bookmark.from(c).find(id))
    // const allPromise = Promise.all(promises);
    // try {
    //     const values = (await allPromise).flat();

    //     return values.map(v => v?.update(payload))

    // } catch (error) {
    //     console.log(error);
    //     return undefined
    // }
  }

  async remove(pk: string) {
    try {
      const res = await Bookmark.findOrFail(pk);
      return await res.delete();
    } catch (error) {
      console.error(error);
      return undefined;
    }

    // const promises = this.containerUrls.map(c => Bookmark.from(c).find(id))
    // const allPromise = Promise.all(promises);
    // try {
    //     const values = (await allPromise).flat();

    //     return values.map(async (v) => await v?.delete())

    // } catch (error) {
    //     console.log(error);
    //     return undefined
    // }
  }
}
