import RDFResourceProperty from './RDFResourceProperty';
import IRI from '../IRI';
// import IRI from '@/solid/utils/IRI';
// import RDFResourceProperty, { RDFResourcePropertyType } from '@/solid/RDFResourceProperty';
// import type { LiteralValue } from '@/solid/RDFResourceProperty';
export default class RDFResource {
    constructor(url) {
        this.url = url;
        this.statements = [];
        this.types = [];
        this.properties = [];
        this.propertiesIndex = {};
    }
    get name() {
        return this.getPropertyValue(IRI('foaf:name'));
    }
    get label() {
        return this.getPropertyValue(IRI('rdfs:label'));
    }
    isType(type) {
        return this.types.indexOf(IRI(type)) !== -1;
    }
    getPropertyValue(property, defaultValue = null) {
        const [resourceProperty] = this.propertiesIndex[IRI(property)] || [];
        return resourceProperty ? resourceProperty.value : defaultValue;
    }
    getPropertyValues(property) {
        const resourceProperties = this.propertiesIndex[IRI(property)] || [];
        return resourceProperties.map(property => property.value);
    }
    addStatement(statement) {
        if (statement.subject.value !== this.url)
            return;
        const property = RDFResourceProperty.fromStatement(statement);
        if (property.type === 0 /* RDFResourcePropertyType.Type */)
            this.types.push(property.value);
        this.statements.push(statement);
        this.properties.push(property);
        this.propertiesIndex[property.name] = [
            ...(this.propertiesIndex[property.name] || []),
            property,
        ];
    }
}
