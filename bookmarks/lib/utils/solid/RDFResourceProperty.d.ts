import type { Quad } from 'rdf-js';
export type LiteralValue = string | number | boolean | Date;
export declare const enum RDFResourcePropertyType {
    Type = 0,
    Reference = 1,
    Literal = 2
}
declare class RDFResourcePropertyVariable {
    name: string;
    constructor(value: string);
}
declare abstract class RDFResourceProperty {
    readonly resourceUrl: string | null;
    readonly name: string;
    readonly value: unknown;
    abstract readonly type: RDFResourcePropertyType;
    static fromStatement(statement: Quad): RDFResourceProperty;
    static literal(resourceUrl: string | null, name: string, value: LiteralValue): RDFResourceProperty;
    static reference(resourceUrl: string | null, name: string, url: string | RDFResourcePropertyVariable | null): RDFResourceReferenceProperty;
    static type(resourceUrl: string | null, type: string): RDFResourceProperty;
    static toTurtle(properties: RDFResourceProperty[], documentUrl?: string | null, explicitSelfReference?: boolean): string;
    private static castLiteralValue;
    protected constructor(resourceUrl: string | null, name: string, value: unknown);
    toTurtle(documentUrl?: string | null, explicitSelfReference?: boolean): string;
    clone(resourceUrl?: string | null): RDFResourceProperty;
    protected getTurtleReference(value: string | null, documentUrl: string | null, explicitSelfReference?: boolean): string;
    protected getTurtleSubject(documentUrl: string | null, explicitSelfReference?: boolean): string;
    protected getTurtlePredicate(): string;
    protected abstract getTurtleObject(documentUrl: string | null): string;
}
declare class RDFResourceReferenceProperty extends RDFResourceProperty {
    readonly value: string | RDFResourcePropertyVariable | null;
    readonly type = RDFResourcePropertyType.Reference;
    constructor(resourceUrl: string | null, name: string, value: string | RDFResourcePropertyVariable | null);
    protected getTurtleObject(documentUrl: string | null): string;
}
export default RDFResourceProperty;
