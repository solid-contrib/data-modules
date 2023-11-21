import { Attributes, FieldType, TimestampField } from "soukai";
import {
  defineSolidModelSchema, SolidContainer,
  SolidDocument,
  SolidModel
} from "soukai-solid";
import { v4 } from "uuid";
import { GetInstanceArgs, ISoukaiDocumentBase } from "../types";
import {
  createTypeIndex,
  getTypeIndexFromPofile,
  registerInTypeIndex
} from "../utils/typeIndexHelpers";

export type IPlace = {
  place: string;
  placeType: "Place";
  description: string;
  startDate: string;
};

export type ICountry = {
  country: string;
  placeType: "Country";
  description: string;
  startDate: string;
};


export type ICreateVisitedPlace = IPlace | ICountry

export type IVisitedPlace = ISoukaiDocumentBase & ICreateVisitedPlace;

export const VisitedPlaceSchema = defineSolidModelSchema({

  rdfContexts: {
    n0: "http://generativeobjects.com/apps#",
    y: "http://dbpedia.org/class/yago/",
    res: "http://dbpedia.org/resource/",
    ont: "http://dbpedia.org/ontology/",
  },

  rdfsClasses: ["n0:VisitedPlace"],

  timestamps: [TimestampField.CreatedAt, TimestampField.UpdatedAt],

  fields: {
    country: { type: FieldType.Key, rdfProperty: "y:WikicatMemberStatesOfTheUnitedNations" }, // optional if placeType === Country
    place: { type: FieldType.Key, rdfProperty: "ont:Place" }, // optional if placeType === Place
    placeType: { type: FieldType.String, rdfProperty: "n0:VisitedPlaceType" }, // Country || Place
    description: { type: FieldType.String, rdfProperty: "schema:description" },
    startDate: { type: FieldType.String, rdfProperty: "schema:startDate" },
  },

});

export class VisitedPlace extends VisitedPlaceSchema { }

export class VisitedPlaceFactory {
  private static instance: VisitedPlaceFactory;

  private constructor(
    private containerUrls: string[] = [],
    private instancesUrls: string[] = []
  ) { }

  public static async getInstance(
    args?: GetInstanceArgs,
    defaultContainerUrl?: string
  ): Promise<VisitedPlaceFactory> {

    if (!VisitedPlace.instance) {
      try {
        const baseURL = args?.webId.split("profile")[0];

        defaultContainerUrl = `${baseURL}${defaultContainerUrl ?? "myvisitedplaces/"}`;

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

          const _containers = await SolidContainer.fromTypeIndex(
            typeIndexUrl,
            VisitedPlace
          );

          if (!_containers || !_containers.length) {
            _containerUrls.push(defaultContainerUrl);

            await registerInTypeIndex({
              forClass: VisitedPlace.rdfsClasses[0],
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
            VisitedPlace
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
            args?.isPrivate ? "private" : "public",
            args?.fetch
          );
          _containerUrls.push(defaultContainerUrl);

          // TODO: it inserts two instances
          await registerInTypeIndex({
            forClass: VisitedPlace.rdfsClasses[0],
            instanceContainer: _containerUrls[0],
            typeIndexUrl: typeIndexUrl,
          });
        }

        VisitedPlaceFactory.instance = new VisitedPlaceFactory(
          _containerUrls,
          _instancesUrls
        );
      } catch (error: any) {
        console.log(error.message);
      }
    }
    return VisitedPlaceFactory.instance;
  }

  async getAll(): Promise<(VisitedPlace & SolidModel)[]> {
    const containerPromises = this.containerUrls.map((c) =>
      VisitedPlace.from(c).all()
    );
    const instancePromises = this.instancesUrls.map((i) =>
      VisitedPlace.all({ $in: [i] })
    );

    const allPromise = Promise.all([...containerPromises, ...instancePromises]);

    try {
      const values = (await allPromise).flat();
      return values;
    } catch (error) {
      console.log(error);
      return [] as (VisitedPlace & SolidModel)[];
    }
  }

  async get(pk: string): Promise<VisitedPlace> {
    const res = await VisitedPlace.findOrFail(pk);

    return res;
  }

  async create(payload: ICreateVisitedPlace): Promise<VisitedPlace> {
    const id = v4();

    const res = new VisitedPlace({
      ...payload,
      id: id,
      url: `${this.containerUrls[0]}${id}`,
    });

    return await res.save();
  }

  async update(pk: string, payload: IVisitedPlace): Promise<VisitedPlace | undefined> {
    try {
      const res = await VisitedPlace.findOrFail(pk);
      return await res.update(payload);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async remove(pk: string): Promise<VisitedPlace | undefined> {
    try {
      const res = await VisitedPlace.findOrFail(pk);
      return await res.delete();
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
