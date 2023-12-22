import type { Quad } from 'rdf-js';
import RDFResourceProperty, { LiteralValue, RDFResourcePropertyType } from './RDFResourceProperty';
import IRI from '../IRI';

/**
 * The RDFResource class represents a resource in an RDF model.
 * It contains the resource's URL, RDF types, properties, and statements.
 */
export default class RDFResource {

    public readonly url: string;
    public readonly types: string[];
    public readonly properties: RDFResourceProperty[];
    public readonly propertiesIndex: Record<string, RDFResourceProperty[]>;
    public readonly statements: Quad[];

    public constructor(url: string) {
        this.url = url;
        this.statements = [];
        this.types = [];
        this.properties = [];
        this.propertiesIndex = {};
    }

    /**
     * Gets the name property value for this RDF resource.
     *
     * @returns The name value, or null if not present.
     */
    public get name(): string | null {
        return this.getPropertyValue(IRI("foaf:name")) as string | null;
    }

    /**
     * Gets the label property value for this RDF resource.
     *
     * @returns The label value, or null if not present.
     */
    public get label(): string | null {
        return this.getPropertyValue(IRI("rdfs:label")) as string | null;
    }

    /**
     * Checks if this RDF resource has the given RDF type.
     *
     * @param type - The RDF type to check for.
     * @returns True if this resource has the type, false otherwise.
     */
    public isType(type: string): boolean {
        return this.types.indexOf(IRI(type)) !== -1;
    }

    /**
     * Gets the value for the given property on this RDF resource.
     *
     * @param property - The property IRI to get the value for.
     * @param defaultValue - The default value to return if no value is found.
     * @returns The property value, or defaultValue if not found.
     */
    public getPropertyValue(property: string, defaultValue: LiteralValue | null = null): LiteralValue | null {
        const [resourceProperty] = this.propertiesIndex[IRI(property)] || [];

        return resourceProperty
            ? (resourceProperty.value as LiteralValue)
            : defaultValue;
    }

    /**
     * Gets all values for the given property on this RDF resource.
     *
     * @param property - The property IRI to get values for.
     * @returns An array of all values for the given property.
     */
    public getPropertyValues(property: string): LiteralValue[] {
        const resourceProperties = this.propertiesIndex[IRI(property)] || [];

        return resourceProperties.map((property) => property.value as LiteralValue);
    }

    /**
     * Adds a statement about this RDF resource to its internal model.
     *
     * Checks if the statement is about this resource, and if so, adds it to the
     * internal arrays tracking types, statements, properties, and property indexes.
     *
     * Used to build up the model of an RDF resource from a series of RDF statements.
     */
    public addStatement(statement: Quad): void {
        if (statement.subject.value !== this.url) return;

        const property = RDFResourceProperty.fromStatement(statement);

        if (property.type === RDFResourcePropertyType.Type)
            this.types.push(property.value as string);

        this.statements.push(statement);
        this.properties.push(property);
        this.propertiesIndex[property.name] = [
            ...(this.propertiesIndex[property.name] || []),
            property,
        ];
    }

}
