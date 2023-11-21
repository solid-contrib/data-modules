import { SolidModel } from "soukai-solid";
import { GetInstanceArgs, ISoukaiDocumentBase } from "../types";
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
export type ICreateVisitedPlace = IPlace | ICountry;
export type IVisitedPlace = ISoukaiDocumentBase & ICreateVisitedPlace;
export declare const VisitedPlaceSchema: import("@noeldemartin/utils").Constructor<{
    id: string;
    description?: string | undefined;
    country?: any;
    place?: any;
    placeType?: string | undefined;
    startDate?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
}> & import("@noeldemartin/utils").Constructor<SolidModel> & typeof SolidModel;
export declare class VisitedPlace extends VisitedPlaceSchema {
}
export declare class VisitedPlaceFactory {
    private containerUrls;
    private instancesUrls;
    private static instance;
    private constructor();
    static getInstance(args?: GetInstanceArgs, defaultContainerUrl?: string): Promise<VisitedPlaceFactory>;
    getAll(): Promise<(VisitedPlace & SolidModel)[]>;
    get(pk: string): Promise<VisitedPlace>;
    create(payload: ICreateVisitedPlace): Promise<VisitedPlace>;
    update(pk: string, payload: IVisitedPlace): Promise<VisitedPlace | undefined>;
    remove(pk: string): Promise<VisitedPlace | undefined>;
}
