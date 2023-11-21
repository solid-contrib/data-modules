import IRI from '@/utils/IRI';
class RDF {
    getJsonLDProperty(json, property) {
        property = IRI(property);
        if (property in json)
            return this.getJsonLDPropertyValue(json[property]);
        if (!('@context' in json))
            return null;
        const context = json['@context'];
        const contextProperty = Object
            .entries(context)
            .find(([_, url]) => property.startsWith(url));
        if (!contextProperty)
            return null;
        const propertyPrefix = (contextProperty[0] === '@vocab' ? '' : `${contextProperty[0]}:`);
        const propertyValue = json[propertyPrefix + property.substr(contextProperty[1].length)];
        return this.getJsonLDPropertyValue(propertyValue);
    }
    getJsonLDPropertyValue(value) {
        if (value === undefined)
            return null;
        return (Array.isArray(value) && value.length === 1) ? value[0] : value;
    }
}
export default new RDF();
