import type { JsonLD, JsonLDGraph, JsonLDResource } from '@noeldemartin/solid-utils';
import type { Quad } from 'rdf-js';
import RDFResource from './RDFResource';
import RDFResourceProperty from './RDFResourceProperty';
export interface TurtleParsingOptions {
    baseIRI: string;
    headers: Headers;
}
export interface CloneOptions {
    changeUrl: string;
    removeResourceUrls: string[];
}
export interface RDFDocumentMetadata {
    containsRelativeIRIs?: boolean;
    describedBy?: string;
    headers?: Headers;
}
export default class RDFDocument {
    private static documentsCache;
    static fromTurtle(turtle: string, options?: Partial<TurtleParsingOptions>): Promise<RDFDocument>;
    static resourceFromJsonLDGraph(documentJson: JsonLDGraph, resourceId: string, resourceJson?: JsonLDResource): Promise<RDFResource>;
    static fromJsonLD(json: JsonLD, baseUrl?: string): Promise<RDFDocument>;
    static reduceJsonLDGraph(json: JsonLDGraph, resourceId: string): JsonLDGraph;
    private static cacheJsonLD;
    private static getFromJsonLD;
    readonly url: string | null;
    readonly metadata: RDFDocumentMetadata;
    statements: Quad[];
    resourcesIndex: Record<string, RDFResource>;
    properties: RDFResourceProperty[];
    resources: RDFResource[];
    constructor(url: string | null, statements?: Quad[], metadata?: RDFDocumentMetadata);
    isEmpty(): boolean;
    hasProperty(resourceUrl: string, name: string): boolean;
    toJsonLD(): Promise<JsonLDGraph>;
    resource(url: string): RDFResource | null;
    requireResource(url: string): RDFResource;
    clone(options?: Partial<CloneOptions>): RDFDocument;
}
