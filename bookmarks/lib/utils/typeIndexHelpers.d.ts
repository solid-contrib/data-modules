import { Fetch, SolidContainer, SolidModel } from "soukai-solid";
export declare function getTypeIndexFromPofile(args: {
    webId: string;
    fetch?: Fetch;
    typePredicate: "solid:publicTypeIndex" | "solid:privateTypeIndex";
}): Promise<string | undefined>;
export declare const registerInTypeIndex: (args: {
    instanceContainer: string;
    forClass: string;
    typeIndexUrl: string;
}) => Promise<void>;
export declare function createTypeIndex(webId: string, type: "public" | "private", fetch?: Fetch): Promise<string>;
export declare function findContainerRegistrations(typeIndexUrl: string, type: string | string[], fetch?: Fetch): Promise<string[]>;
export declare function findInstanceRegistrations(typeIndexUrl: string, type: string | string[], fetch?: Fetch): Promise<string[]>;
export declare const fromTypeIndex: (typeIndexUrl: string, childrenModelClass: typeof SolidModel) => Promise<SolidContainer[] | undefined>;
