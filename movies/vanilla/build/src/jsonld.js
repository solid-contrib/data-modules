export function getJsonLdField(entry, pred, subPred) {
    if (Array.isArray(entry[pred]) && entry[pred].length === 1) {
        return entry[pred][0][subPred];
    }
    return undefined;
}
export function getJsonLdId(entry) {
    return entry['@id'];
}
export function getJsonLdType(entry) {
    const types = entry['@type'];
    if (Array.isArray(types)) {
        return types[0];
    }
    return undefined;
}
export function getJsonLdFieldMulti(entry, pred, subPred) {
    if (Array.isArray(entry[pred]) && entry[pred].length === 1) {
        return entry[pred].map((obj) => obj[subPred]);
    }
    return undefined;
}
export function getJsonLdLinkField(entry, pred) {
    return getJsonLdField(entry, pred, '@id');
}
export function getJsonLdStringField(entry, pred) {
    return getJsonLdField(entry, pred, '@value');
}
export function getJsonLdStringFieldMulti(entry, pred) {
    return getJsonLdFieldMulti(entry, pred, '@id');
}
export function getJsonLdDateField(entry, pred) {
    const typeStr = getJsonLdField(entry, pred, '@type');
    if (typeStr === 'http://www.w3.org/2001/XMLSchema#dateTime') {
        const valueStr = getJsonLdStringField(entry, pred);
        if (typeof valueStr === 'string') {
            return new Date(valueStr);
        }
    }
    return undefined;
}
//# sourceMappingURL=jsonld.js.map