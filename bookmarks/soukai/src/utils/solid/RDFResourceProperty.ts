import type { Literal, Quad } from 'rdf-js';
import IRI from '../IRI';

/**
 * The LiteralValue type defines the possible primitive values that can be used for RDF literals.
 * This includes strings, numbers, booleans, and Date objects.
 */
export type LiteralValue = string | number | boolean | Date;

/**
 * RDFResourcePropertyType is an enum representing the different types of RDF resource properties.
 *
 * - Type: The type or class of the resource.
 * - Reference: A reference or relationship to another resource.
 * - Literal: A literal value like a string, number, etc.
 */
export const enum RDFResourcePropertyType {
    Type,
    Reference,
    Literal,
}

/**
 * The RDFResourcePropertyVariable class represents a variable value in an RDF quad/statement.
 * It is used when the object of a statement is a variable instead of a concrete value.
 */
class RDFResourcePropertyVariable {

    public name: string;

    constructor(value: string) {
        this.name = value;
    }

}

/**
 * DataTypes maps common RDF data type IRIs to constants for convenience.
 */
const DataTypes = {
    dateTime: IRI("xsd:dateTime"),
    integer: IRI("xsd:integer"),
    boolean: IRI("xsd:boolean"),
    decimal: IRI("xsd:decimal"),
    float: IRI("xsd:float"),
    double: IRI("xsd:double"),
};

/**
 * Abstract base class for representing properties on RDF resources.
 * Subclasses define specific property types like references, literals, etc.
 */
abstract class RDFResourceProperty {

    public readonly resourceUrl: string | null;
    public readonly name: string;
    public readonly value: unknown;
    public abstract readonly type: RDFResourcePropertyType;

    /**
     * Creates an RDFResourceProperty instance from an RDF statement (Quad).
     *
     * It inspects the statement to determine the type of property:
     * - Type property if predicate is rdf:type
     * - Reference property if object is a NamedNode or BlankNode
     * - Literal property if object is a literal value
     *
     * Handles object variables by creating an RDFResourcePropertyVariable instance.
     */
    public static fromStatement(statement: Quad): RDFResourceProperty {
        const resourceUrl =
            statement.subject.termType === "NamedNode"
                ? statement.subject.value
                : null;

        if (statement.predicate.value === IRI("rdf:type")) {
            return this.type(resourceUrl, statement.object.value);
        }

        if (statement.object.termType === "NamedNode") {
            return this.reference(
                resourceUrl,
                statement.predicate.value,
                statement.object.value
            );
        }

        if (statement.object.termType === "BlankNode") {
            return this.reference(resourceUrl, statement.predicate.value, null);
        }

        if (statement.object.termType === "Variable") {
            return this.reference(
                resourceUrl,
                statement.predicate.value,
                new RDFResourcePropertyVariable(statement.object.value)
            );
        }

        return this.literal(
            resourceUrl,
            statement.predicate.value,
            this.castLiteralValue(
                statement.object.value,
                (statement.object as Literal).datatype.value
            )
        );
    }

    /**
     * Creates a new RDFResourceLiteralProperty instance.
     *
     * @param resourceUrl - The URL of the resource this property belongs to.
     * @param name - The name of the property.
     * @param value - The literal value of the property.
     */
    public static literal(
        resourceUrl: string | null,
        name: string,
        value: LiteralValue
    ): RDFResourceProperty {
        return new RDFResourceLiteralProperty(resourceUrl, name, value);
    }

    /**
     * Creates a new RDFResourceReferenceProperty instance.
     *
     * @param resourceUrl - The URL of the resource this property belongs to.
     * @param name - The name of the property.
     * @param url - The URL value of the property.
     */
    public static reference(
        resourceUrl: string | null,
        name: string,
        url: string | RDFResourcePropertyVariable | null
    ): RDFResourceReferenceProperty {
        return new RDFResourceReferenceProperty(resourceUrl, name, url);
    }

    /**
     * Creates a new RDFResourceTypeProperty instance.
     *
     * @param resourceUrl - The URL of the resource this property belongs to.
     * @param type - The type value of the property.
     */
    public static type(
        resourceUrl: string | null,
        type: string
    ): RDFResourceProperty {
        return new RDFResourceTypeProperty(resourceUrl, type);
    }

    /**
     * Converts an array of RDFResourceProperty instances to a Turtle document.
     *
     * @param properties - The array of RDFResourceProperty instances to convert.
     * @param documentUrl - The base URL to use for subjects. If not specified, subjects will be serialized as relative URLs.
     * @param explicitSelfReference - If true, subjects will always be serialized as full URLs instead of relative references.
     * @returns A Turtle document containing the RDF statements for the properties.
     */
    public static toTurtle(
        properties: RDFResourceProperty[],
        documentUrl: string | null = null,
        explicitSelfReference: boolean = false
    ): string {
        return properties
            .map(
                (property) =>
                    property.toTurtle(documentUrl, explicitSelfReference) + " ."
            )
            .join("\n");
    }

    /**
     * Converts a literal value string to the appropriate JavaScript literal type
     * based on the provided RDF datatype. This handles common XSD types like
     * xsd:integer, xsd:boolean, etc.
     *
     * @param value - The literal value string
     * @param datatype - The RDF datatype URI
     * @returns The converted JavaScript literal value
     */
    private static castLiteralValue(
        value: string,
        datatype: string
    ): LiteralValue {
        switch (datatype) {
            case DataTypes.dateTime:
                return new Date(value);
            case DataTypes.integer:
            case DataTypes.decimal:
                return parseInt(value);
            case DataTypes.boolean:
                return value === "true" || value === "1";
            case DataTypes.float:
            case DataTypes.double:
                return parseFloat(value);
        }

        return value;
    }

    protected constructor(resourceUrl: string | null, name: string, value: unknown) {
        this.resourceUrl = resourceUrl;
        this.name = name;
        this.value = value;
    }

    /**
     * Converts the RDF resource property to a Turtle representation.
     *
     * @param documentUrl - The URL of the containing RDF document.
     * @param explicitSelfReference - If true, explicitly include the document URL as the subject even if it is the default.
     * @returns The Turtle representation of the RDF resource property.
     */
    public toTurtle(
        documentUrl: string | null = null,
        explicitSelfReference: boolean = false
    ): string {
        const subject = this.getTurtleSubject(documentUrl, explicitSelfReference);
        const predicate = this.getTurtlePredicate();
        const object = this.getTurtleObject(documentUrl);

        return `${subject} ${predicate} ${object}`;
    }

    /**
     * Clones the RDF resource property with an optional different resource URL.
     *
     * @param resourceUrl - Optional different resource URL for the cloned property.
     * @returns Cloned RDF resource property.
     */
    public clone(resourceUrl?: string | null): RDFResourceProperty {
        resourceUrl = resourceUrl ?? this.resourceUrl;

        switch (this.type) {
            case RDFResourcePropertyType.Literal:
                return RDFResourceProperty.literal(
                    resourceUrl,
                    this.name,
                    this.value as LiteralValue
                );
            case RDFResourcePropertyType.Type:
                return RDFResourceProperty.type(resourceUrl, this.value as string);
            case RDFResourcePropertyType.Reference:
                return RDFResourceProperty.reference(
                    resourceUrl,
                    this.name,
                    this.value as string
                );
        }
    }
    /**
     * Generates a Turtle representation of a reference value.
     *
     * Handles different cases:
     * - Reference to current document
     * - Reference to different document
     * - Reference to fragment within current document
     *
     * Encodes URIs for safety.
     */
    protected getTurtleReference(
        value: string | null,
        documentUrl: string | null,
        explicitSelfReference: boolean = false
    ): string {
        const hashIndex = value?.indexOf("#") ?? -1;

        if (!value || value === documentUrl) {
            return documentUrl && explicitSelfReference
                ? `<${encodeURI(documentUrl)}>`
                : "<>";
        }

        if (
            documentUrl === null ||
            !value.startsWith(documentUrl) ||
            hashIndex === -1
        ) {
            return `<${encodeURI(value)}>`;
        }

        return `<#${value.substr(hashIndex + 1)}>`;
    }

    protected getTurtleSubject(documentUrl: string | null, explicitSelfReference: boolean = false): string {
        return this.getTurtleReference(this.resourceUrl, documentUrl, explicitSelfReference);
    }

    protected getTurtlePredicate(): string {
        return `<${encodeURI(this.name)}>`;
    }

    protected abstract getTurtleObject(documentUrl: string | null): string;

}

/**
 * Class representing a literal property in an RDF resource.
 * Extends RDFResourceProperty and handles converting the literal value to a Turtle representation.
 */
class RDFResourceLiteralProperty extends RDFResourceProperty {

    declare public readonly value: LiteralValue;
    public readonly type = RDFResourcePropertyType.Literal;

    constructor(resourceUrl: string | null, name: string, value: LiteralValue) {
        super(resourceUrl, name, value);
    }

    /**
     * Converts the value to a Turtle object representation.
     * Handles Date values by formatting them as xsd:dateTime strings.
     * Other values are JSON stringified.
     */
    protected getTurtleObject(): string {
        if (this.value instanceof Date) {
            const digits = (...numbers: number[]) =>
                numbers.map((number) => number.toString().padStart(2, "0"));
            const date = digits(
                this.value.getUTCFullYear(),
                this.value.getUTCMonth() + 1,
                this.value.getUTCDate()
            ).join("-");
            const time = digits(
                this.value.getUTCHours(),
                this.value.getUTCMinutes(),
                this.value.getUTCSeconds()
            ).join(":");
            const milliseconds = this.value
                .getUTCMilliseconds()
                .toString()
                .padStart(3, "0");

            return `"${date}T${time}.${milliseconds}Z"^^<${IRI("xsd:dateTime")}>`;
        }

        return JSON.stringify(this.value);
    }

}

/**
 * Class representing a reference property in an RDF resource.
 * Extends RDFResourceProperty and handles converting the reference value
 * to a Turtle object representation.
 */
class RDFResourceReferenceProperty extends RDFResourceProperty {

    declare public readonly value: string | RDFResourcePropertyVariable | null;
    public readonly type = RDFResourcePropertyType.Reference;

    constructor(
        resourceUrl: string | null,
        name: string,
        value: string | RDFResourcePropertyVariable | null,
    ) {
        super(resourceUrl, name, value);
    }

    /**
     * Converts the property value to a Turtle object representation.
     * If the value is a variable, returns the variable name.
     * Otherwise calls getTurtleReference() to convert to a Turtle reference.
     */
    protected getTurtleObject(documentUrl: string | null): string {
        if (this.value instanceof RDFResourcePropertyVariable)
            return this.value.name;

        return this.getTurtleReference(this.value, documentUrl);
    }

}

/**
 * Class representing the rdf:type property in an RDF resource.
 * Extends RDFResourceProperty and handles converting the type value
 * to a Turtle object representation.
 */
class RDFResourceTypeProperty extends RDFResourceProperty {

    declare public readonly value: string;
    public readonly type = RDFResourcePropertyType.Type;

    constructor(resourceUrl: string | null, value: string) {
        super(resourceUrl, IRI('rdf:type'), value);
    }

    /**
     * Returns the predicate (property name) to use when generating
     * Turtle syntax for this RDF resource property.
     *
     * For the rdf:type property, this will return 'a' to match the
     * abbreviated syntax for rdf:type in Turtle.
     */
    protected getTurtlePredicate(): string {
        return "a";
    }

    /**
     * Converts the RDFResourceProperty value to a Turtle URI reference string.
     * Encodes the value as a URI using encodeURI() before generating the Turtle.
     */
    protected getTurtleObject(): string {
        return `<${encodeURI(this.value)}>`;
    }

}

export default RDFResourceProperty;
