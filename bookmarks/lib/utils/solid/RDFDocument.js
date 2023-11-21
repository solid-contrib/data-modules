var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fail, objectMap, tap, urlResolve, urlRoute } from '@noeldemartin/utils';
import { jsonldToQuads, parseTurtle, quadsToJsonLD } from '@noeldemartin/solid-utils';
import { SoukaiError } from 'soukai';
import RDFResource from './RDFResource';
export default class RDFDocument {
    static fromTurtle(turtle, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield parseTurtle(turtle, {
                baseIRI: options.baseIRI,
            });
            return new RDFDocument(options.baseIRI || '', data.quads, {
                containsRelativeIRIs: data.containsRelativeIRIs,
                describedBy: getDescribedBy(options),
                headers: options.headers,
            });
        });
    }
    static resourceFromJsonLDGraph(documentJson, resourceId, resourceJson) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const requireResourceJson = () => {
                var _a;
                return (_a = resourceJson !== null && resourceJson !== void 0 ? resourceJson : documentJson['@graph'].find(entity => entity['@id'] === resourceId)) !== null && _a !== void 0 ? _a : fail(SoukaiError, `Resource '${resourceId}' not found on document`);
            };
            const document = (_a = this.documentsCache.get(documentJson)) !== null && _a !== void 0 ? _a : yield this.fromJsonLD(requireResourceJson());
            return document.requireResource(resourceId);
        });
    }
    static fromJsonLD(json, baseUrl) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (_a = this.documentsCache.get(json)) !== null && _a !== void 0 ? _a : yield this.getFromJsonLD(json, baseUrl);
        });
    }
    static reduceJsonLDGraph(json, resourceId) {
        return tap({ '@graph': json['@graph'].filter(resource => resource['@id'] !== resourceId) }, reducedJson => {
            const document = this.documentsCache.get(json);
            if (!document) {
                return;
            }
            this.cacheJsonLD(reducedJson, document.clone({ removeResourceUrls: [resourceId] }));
        });
    }
    static cacheJsonLD(json, document) {
        this.documentsCache.set(json, document);
    }
    static getFromJsonLD(json, baseUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const quads = yield jsonldToQuads(json, baseUrl);
            return tap(new RDFDocument(json['@id'] ? urlRoute(json['@id']) : null, quads), document => {
                this.documentsCache.set(json, document);
            });
        });
    }
    constructor(url, statements = [], metadata = {}) {
        this.url = url;
        this.statements = statements;
        this.metadata = metadata;
        this.resourcesIndex = this.statements.reduce((resourcesIndex, statement) => {
            var _a;
            const resourceUrl = statement.subject.value;
            const resource = resourcesIndex[resourceUrl] = (_a = resourcesIndex[resourceUrl]) !== null && _a !== void 0 ? _a : new RDFResource(resourceUrl);
            resource.addStatement(statement);
            return resourcesIndex;
        }, {});
        this.resources = Object.values(this.resourcesIndex);
        this.properties = this.resources.reduce((properties, resource) => properties.concat(resource.properties), []);
    }
    isEmpty() {
        return this.statements.length === 0;
    }
    hasProperty(resourceUrl, name) {
        const resource = this.resourcesIndex[resourceUrl];
        return !!resource && name in resource.propertiesIndex;
    }
    toJsonLD() {
        return __awaiter(this, void 0, void 0, function* () {
            return quadsToJsonLD(this.statements);
        });
    }
    resource(url) {
        var _a;
        return (_a = this.resourcesIndex[url]) !== null && _a !== void 0 ? _a : null;
    }
    requireResource(url) {
        const resource = this.resource(url);
        if (!resource)
            throw new SoukaiError(`Resource '${url}' not found`);
        return resource;
    }
    clone(options = {}) {
        var _a;
        return tap(new RDFDocument((_a = options.changeUrl) !== null && _a !== void 0 ? _a : this.url, [], this.metadata), document => {
            const removeResourceUrls = options.removeResourceUrls;
            if (!removeResourceUrls) {
                document.statements = this.statements.slice(0);
                document.properties = this.properties.slice(0);
                document.resources = this.resources.slice(0);
                document.resourcesIndex = Object.assign({}, this.resourcesIndex);
                return;
            }
            document.statements = this.statements.filter(statement => !removeResourceUrls.includes(statement.subject.value));
            document.properties = this.properties.filter(property => !property.resourceUrl || !removeResourceUrls.includes(property.resourceUrl));
            document.resources = this.resources.filter(resource => !removeResourceUrls.includes(resource.url));
            document.resourcesIndex = objectMap(document.resources, 'url');
        });
    }
}
RDFDocument.documentsCache = new WeakMap();
function getDescribedBy(options = {}) {
    var _a, _b;
    if (!((_a = options.headers) === null || _a === void 0 ? void 0 : _a.has('Link')))
        return undefined;
    const matches = (_b = options.headers.get('Link')) === null || _b === void 0 ? void 0 : _b.match(/<([^>]+)>;\s*rel="describedBy"/i);
    if (!matches)
        return undefined;
    return urlResolve(options.baseIRI || '', matches[1]);
}
