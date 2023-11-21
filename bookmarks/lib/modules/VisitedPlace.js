var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FieldType, TimestampField } from "soukai";
import { defineSolidModelSchema, SolidContainer, SolidDocument } from "soukai-solid";
import { v4 } from "uuid";
import { createTypeIndex, getTypeIndexFromPofile, registerInTypeIndex } from "../utils/typeIndexHelpers";
export const VisitedPlaceSchema = defineSolidModelSchema({
    rdfContexts: {
        n0: "http://generativeobjects.com/apps#",
        y: "http://dbpedia.org/class/yago/",
        res: "http://dbpedia.org/resource/",
        ont: "http://dbpedia.org/ontology/",
    },
    rdfsClasses: ["n0:VisitedPlace"],
    timestamps: [TimestampField.CreatedAt, TimestampField.UpdatedAt],
    fields: {
        country: { type: FieldType.Key, rdfProperty: "y:WikicatMemberStatesOfTheUnitedNations" },
        place: { type: FieldType.Key, rdfProperty: "ont:Place" },
        placeType: { type: FieldType.String, rdfProperty: "n0:VisitedPlaceType" },
        description: { type: FieldType.String, rdfProperty: "schema:description" },
        startDate: { type: FieldType.String, rdfProperty: "schema:startDate" },
    },
});
export class VisitedPlace extends VisitedPlaceSchema {
}
export class VisitedPlaceFactory {
    constructor(containerUrls = [], instancesUrls = []) {
        this.containerUrls = containerUrls;
        this.instancesUrls = instancesUrls;
    }
    static getInstance(args, defaultContainerUrl) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!VisitedPlace.instance) {
                try {
                    const baseURL = args === null || args === void 0 ? void 0 : args.webId.split("profile")[0];
                    defaultContainerUrl = `${baseURL}${defaultContainerUrl !== null && defaultContainerUrl !== void 0 ? defaultContainerUrl : "myvisitedplaces/"}`;
                    let _containerUrls = [];
                    let _instancesUrls = [];
                    const typeIndexUrl = yield getTypeIndexFromPofile({
                        webId: (_a = args === null || args === void 0 ? void 0 : args.webId) !== null && _a !== void 0 ? _a : "",
                        fetch: args === null || args === void 0 ? void 0 : args.fetch,
                        typePredicate: (args === null || args === void 0 ? void 0 : args.isPrivate)
                            ? "solid:privateTypeIndex"
                            : "solid:publicTypeIndex",
                    });
                    if (typeIndexUrl) {
                        const _containers = yield SolidContainer.fromTypeIndex(typeIndexUrl, VisitedPlace);
                        if (!_containers || !_containers.length) {
                            _containerUrls.push(defaultContainerUrl);
                            yield registerInTypeIndex({
                                forClass: VisitedPlace.rdfsClasses[0],
                                instanceContainer: _containerUrls[0],
                                typeIndexUrl: typeIndexUrl,
                            });
                        }
                        else {
                            _containerUrls = [
                                ..._containerUrls,
                                ..._containers.map((c) => c.url),
                            ];
                        }
                        const _instances = yield SolidDocument.fromTypeIndex(typeIndexUrl, VisitedPlace);
                        if (_instances.length) {
                            _instancesUrls = [
                                ..._instancesUrls,
                                ..._instances.map((c) => c.url),
                            ];
                        }
                    }
                    else {
                        // Create TypeIndex
                        const typeIndexUrl = yield createTypeIndex((_b = args === null || args === void 0 ? void 0 : args.webId) !== null && _b !== void 0 ? _b : "", (args === null || args === void 0 ? void 0 : args.isPrivate) ? "private" : "public", args === null || args === void 0 ? void 0 : args.fetch);
                        _containerUrls.push(defaultContainerUrl);
                        // TODO: it inserts two instances
                        yield registerInTypeIndex({
                            forClass: VisitedPlace.rdfsClasses[0],
                            instanceContainer: _containerUrls[0],
                            typeIndexUrl: typeIndexUrl,
                        });
                    }
                    VisitedPlaceFactory.instance = new VisitedPlaceFactory(_containerUrls, _instancesUrls);
                }
                catch (error) {
                    console.log(error.message);
                }
            }
            return VisitedPlaceFactory.instance;
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const containerPromises = this.containerUrls.map((c) => VisitedPlace.from(c).all());
            const instancePromises = this.instancesUrls.map((i) => VisitedPlace.all({ $in: [i] }));
            const allPromise = Promise.all([...containerPromises, ...instancePromises]);
            try {
                const values = (yield allPromise).flat();
                return values;
            }
            catch (error) {
                console.log(error);
                return [];
            }
        });
    }
    get(pk) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield VisitedPlace.findOrFail(pk);
            return res;
        });
    }
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = v4();
            const res = new VisitedPlace(Object.assign(Object.assign({}, payload), { id: id, url: `${this.containerUrls[0]}${id}` }));
            return yield res.save();
        });
    }
    update(pk, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield VisitedPlace.findOrFail(pk);
                return yield res.update(payload);
            }
            catch (error) {
                console.log(error);
                return undefined;
            }
        });
    }
    remove(pk) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield VisitedPlace.findOrFail(pk);
                return yield res.delete();
            }
            catch (error) {
                console.error(error);
                return undefined;
            }
        });
    }
}
