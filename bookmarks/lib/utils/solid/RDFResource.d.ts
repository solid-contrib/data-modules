import type { Quad } from 'rdf-js';
import RDFResourceProperty, { LiteralValue } from './RDFResourceProperty';
export default class RDFResource {
    readonly url: string;
    readonly types: string[];
    readonly properties: RDFResourceProperty[];
    readonly propertiesIndex: Record<string, RDFResourceProperty[]>;
    readonly statements: Quad[];
    constructor(url: string);
    get name(): string | null;
    get label(): string | null;
    isType(type: string): boolean;
    getPropertyValue(property: string, defaultValue?: LiteralValue | null): LiteralValue | null;
    getPropertyValues(property: string): LiteralValue[];
    addStatement(statement: Quad): void;
}
