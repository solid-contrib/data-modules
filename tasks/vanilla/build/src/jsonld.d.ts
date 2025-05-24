export declare function getJsonLdField(entry: object, pred: string, subPred: string): string | undefined;
export declare function getJsonLdId(entry: object): string | undefined;
export declare function getJsonLdType(entry: object): string | undefined;
export declare function getJsonLdFieldMulti(entry: object, pred: string, subPred: string): string[] | undefined;
export declare function getJsonLdLinkField(entry: object, pred: string): string | undefined;
export declare function getJsonLdStringField(entry: object, pred: string): string | undefined;
export declare function getJsonLdStringFieldMulti(entry: object, pred: string): string[] | undefined;
export declare function getJsonLdDateField(entry: object, pred: string): Date | undefined;
