import IRI from '../IRI';
class RDFResourcePropertyVariable {
    constructor(value) {
        this.name = value;
    }
}
const DataTypes = {
    dateTime: IRI('xsd:dateTime'),
    integer: IRI('xsd:integer'),
    boolean: IRI('xsd:boolean'),
    decimal: IRI('xsd:decimal'),
    float: IRI('xsd:float'),
    double: IRI('xsd:double'),
};
class RDFResourceProperty {
    static fromStatement(statement) {
        const resourceUrl = statement.subject.termType === 'NamedNode'
            ? statement.subject.value
            : null;
        if (statement.predicate.value === IRI('rdf:type')) {
            return this.type(resourceUrl, statement.object.value);
        }
        if (statement.object.termType === 'NamedNode') {
            return this.reference(resourceUrl, statement.predicate.value, statement.object.value);
        }
        if (statement.object.termType === 'BlankNode') {
            return this.reference(resourceUrl, statement.predicate.value, null);
        }
        if (statement.object.termType === 'Variable') {
            return this.reference(resourceUrl, statement.predicate.value, new RDFResourcePropertyVariable(statement.object.value));
        }
        return this.literal(resourceUrl, statement.predicate.value, this.castLiteralValue(statement.object.value, statement.object.datatype.value));
    }
    static literal(resourceUrl, name, value) {
        return new RDFResourceLiteralProperty(resourceUrl, name, value);
    }
    static reference(resourceUrl, name, url) {
        return new RDFResourceReferenceProperty(resourceUrl, name, url);
    }
    static type(resourceUrl, type) {
        return new RDFResourceTypeProperty(resourceUrl, type);
    }
    static toTurtle(properties, documentUrl = null, explicitSelfReference = false) {
        return properties
            .map(property => property.toTurtle(documentUrl, explicitSelfReference) + ' .')
            .join('\n');
    }
    static castLiteralValue(value, datatype) {
        switch (datatype) {
            case DataTypes.dateTime:
                return new Date(value);
            case DataTypes.integer:
            case DataTypes.decimal:
                return parseInt(value);
            case DataTypes.boolean:
                return value === 'true' || value === '1';
            case DataTypes.float:
            case DataTypes.double:
                return parseFloat(value);
        }
        return value;
    }
    constructor(resourceUrl, name, value) {
        this.resourceUrl = resourceUrl;
        this.name = name;
        this.value = value;
    }
    toTurtle(documentUrl = null, explicitSelfReference = false) {
        const subject = this.getTurtleSubject(documentUrl, explicitSelfReference);
        const predicate = this.getTurtlePredicate();
        const object = this.getTurtleObject(documentUrl);
        return `${subject} ${predicate} ${object}`;
    }
    clone(resourceUrl) {
        resourceUrl = resourceUrl !== null && resourceUrl !== void 0 ? resourceUrl : this.resourceUrl;
        switch (this.type) {
            case 2 /* RDFResourcePropertyType.Literal */:
                return RDFResourceProperty.literal(resourceUrl, this.name, this.value);
            case 0 /* RDFResourcePropertyType.Type */:
                return RDFResourceProperty.type(resourceUrl, this.value);
            case 1 /* RDFResourcePropertyType.Reference */:
                return RDFResourceProperty.reference(resourceUrl, this.name, this.value);
        }
    }
    getTurtleReference(value, documentUrl, explicitSelfReference = false) {
        var _a;
        const hashIndex = (_a = value === null || value === void 0 ? void 0 : value.indexOf('#')) !== null && _a !== void 0 ? _a : -1;
        if (!value || value === documentUrl) {
            return documentUrl && explicitSelfReference ? `<${encodeURI(documentUrl)}>` : '<>';
        }
        if (documentUrl === null || !value.startsWith(documentUrl) || hashIndex === -1) {
            return `<${encodeURI(value)}>`;
        }
        return `<#${value.substr(hashIndex + 1)}>`;
    }
    getTurtleSubject(documentUrl, explicitSelfReference = false) {
        return this.getTurtleReference(this.resourceUrl, documentUrl, explicitSelfReference);
    }
    getTurtlePredicate() {
        return `<${encodeURI(this.name)}>`;
    }
}
class RDFResourceLiteralProperty extends RDFResourceProperty {
    constructor(resourceUrl, name, value) {
        super(resourceUrl, name, value);
        this.type = 2 /* RDFResourcePropertyType.Literal */;
    }
    getTurtleObject() {
        if (this.value instanceof Date) {
            const digits = (...numbers) => numbers.map(number => number.toString().padStart(2, '0'));
            const date = digits(this.value.getUTCFullYear(), this.value.getUTCMonth() + 1, this.value.getUTCDate()).join('-');
            const time = digits(this.value.getUTCHours(), this.value.getUTCMinutes(), this.value.getUTCSeconds()).join(':');
            const milliseconds = this.value.getUTCMilliseconds().toString().padStart(3, '0');
            return `"${date}T${time}.${milliseconds}Z"^^<${IRI('xsd:dateTime')}>`;
        }
        return JSON.stringify(this.value);
    }
}
class RDFResourceReferenceProperty extends RDFResourceProperty {
    constructor(resourceUrl, name, value) {
        super(resourceUrl, name, value);
        this.type = 1 /* RDFResourcePropertyType.Reference */;
    }
    getTurtleObject(documentUrl) {
        if (this.value instanceof RDFResourcePropertyVariable)
            return this.value.name;
        return this.getTurtleReference(this.value, documentUrl);
    }
}
class RDFResourceTypeProperty extends RDFResourceProperty {
    constructor(resourceUrl, value) {
        super(resourceUrl, IRI('rdf:type'), value);
        this.type = 0 /* RDFResourcePropertyType.Type */;
    }
    getTurtlePredicate() {
        return 'a';
    }
    getTurtleObject() {
        return `<${encodeURI(this.value)}>`;
    }
}
export default RDFResourceProperty;
