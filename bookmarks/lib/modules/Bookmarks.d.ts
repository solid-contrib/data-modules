import { SolidModel } from "soukai-solid";
import { GetInstanceArgs, ISoukaiDocumentBase } from "../types";
export type ICreateBookmark = {
    topic: string;
    label: string;
    link: string;
};
export type IBookmark = ISoukaiDocumentBase & ICreateBookmark;
export declare const BookmarkSchema: import("@noeldemartin/utils").Constructor<{
    id: string;
    link?: any;
    label?: string | undefined;
    topic?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
}> & import("@noeldemartin/utils").Constructor<SolidModel> & typeof SolidModel;
export declare class Bookmark extends BookmarkSchema {
}
export declare class BookmarkFactory {
    private containerUrls;
    private instancesUrls;
    private static instance;
    private constructor();
    static getInstance(args?: GetInstanceArgs, defaultContainerUrl?: string): Promise<BookmarkFactory>;
    getAll(): Promise<(Bookmark & SolidModel)[]>;
    get(pk: string): Promise<Bookmark>;
    create(payload: ICreateBookmark): Promise<Bookmark>;
    update(pk: string, payload: IBookmark): Promise<Bookmark | undefined>;
    remove(pk: string): Promise<Bookmark | undefined>;
}
