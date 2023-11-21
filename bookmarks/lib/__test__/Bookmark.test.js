var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import RDFDocument from "@/utils/solid/RDFDocument";
import RDFResourceProperty from "@/utils/solid/RDFResourceProperty";
import { tap } from "@noeldemartin/utils";
import { readFileSync } from "fs";
import { bootModels, setEngine } from "soukai";
import { SolidEngine } from "soukai-solid";
import { Bookmark } from "../modules/Bookmarks";
import StubFetcher from "../utils/StubFetcher";
// import { fakeDocumentUrl } from "@/testing/utils";
// import RDFDocument from "soukai-solid/src/solid/RDFDocument"
// import RDFResourceProperty from "soukai-solid/src/solid/RDFResourceProperty"
export function loadFixture(name) {
    const raw = readFileSync(`${__dirname}/fixtures/${name}`).toString();
    return /\.json(ld)$/.test(name) ? JSON.parse(raw) : raw;
}
const fixture = (name) => loadFixture(`bookmarks/${name}`);
describe("Bookmark CRUD", () => {
    let fetch;
    beforeEach(() => {
        fetch = jest.fn((...args) => StubFetcher.fetch(...args));
        Bookmark.collection = "https://fake-pod.com/bookmarks/";
        setEngine(new SolidEngine(fetch));
        bootModels({
            Bookmark: Bookmark,
        });
    });
    it("Create", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        // Arrange
        const label = "Google";
        const topic = "Search Engine";
        const link = "https://google.com";
        const date = new Date("2023-01-01:00:00Z");
        StubFetcher.addFetchResponse();
        StubFetcher.addFetchResponse();
        // Act
        const bookmark = new Bookmark({ label, topic, link });
        bookmark.metadata.createdAt = date;
        bookmark.metadata.updatedAt = date;
        yield bookmark.save();
        // Assert
        expect(fetch).toHaveBeenCalledTimes(2);
        expect((_b = (_a = fetch.mock.calls[1]) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.body).toEqualSparql(`
      INSERT DATA { 
        <#it> a <http://www.w3.org/2002/01/bookmark#Bookmark> .
        <#it> <http://www.w3.org/2000/01/rdf-schema#label> "Google" .
        <#it> <http://www.w3.org/2002/01/bookmark#hasTopic> "Search Engine" .
        <#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://google.com> .
        <#it-metadata> a <https://vocab.noeldemartin.com/crdt/Metadata> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/createdAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/updatedAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> . 
      }
    `);
        // expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql(`
        //   INSERT DATA { 
        //     <#it> a <http://www.w3.org/2002/01/bookmark#Bookmark> .
        //     <#it> <http://www.w3.org/2002/01/bookmark#hasTopic> "Search Engine" .
        //     <#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://google.com> .
        //     <#it> <http://www.w3.org/2002/01/bookmark#label> "Google" .
        //     <#it-metadata> a <https://vocab.noeldemartin.com/crdt/Metadata> .
        //     <#it-metadata> <https://vocab.noeldemartin.com/crdt/createdAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        //     <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> .
        //     <#it-metadata> <https://vocab.noeldemartin.com/crdt/updatedAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> . 
        //   }
        // `);
    }));
    it("Read", () => __awaiter(void 0, void 0, void 0, function* () {
        const label = "Google";
        const topic = "Search Engine";
        const link = "https://google.com";
        // Arrange
        StubFetcher.addFetchResponse(fixture("google.ttl"), {
            "WAC-Allow": 'public="read"',
        });
        // Act
        const bookmark = (yield Bookmark.find("solid://bookmarks/google#it"));
        // console.log(bookmark.link);
        // Assert
        expect(bookmark).toBeInstanceOf(Bookmark);
        expect(bookmark.url).toEqual("solid://bookmarks/google#it");
        expect(bookmark.label).toEqual(label);
        expect(bookmark.topic).toEqual(topic);
        expect(bookmark.link).toEqual(link);
    }));
    it("Update", () => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        const label = "Google";
        const topic = "Search Engine";
        const link = "https://google.com";
        const date = new Date("2023-01-01:00:00Z");
        // Arrange
        const stub = yield createStub({
            label,
            link,
            topic,
        });
        const bookmark = new Bookmark(stub.getAttributes(), true);
        StubFetcher.addFetchResponse();
        // // Act
        bookmark.setAttribute("label", label);
        bookmark.setAttribute("link", link);
        bookmark.setAttribute("topic", topic);
        bookmark.metadata.createdAt = date;
        bookmark.metadata.updatedAt = date;
        yield bookmark.save();
        // // Assert
        expect(bookmark.label).toBe(label);
        expect(fetch).toHaveBeenCalledTimes(2);
        expect((_d = (_c = fetch.mock.calls[1]) === null || _c === void 0 ? void 0 : _c[1]) === null || _d === void 0 ? void 0 : _d.body).toEqualSparql(`
      DELETE DATA { 
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> . 
      };
      INSERT DATA { 
        <#it-metadata> a <https://vocab.noeldemartin.com/crdt/Metadata> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/createdAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/updatedAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> . 
      }
    `);
    }));
});
function createStub(attributes) {
    return __awaiter(this, void 0, void 0, function* () {
        return tap(new Bookmark(attributes, true), (stub) => __awaiter(this, void 0, void 0, function* () {
            stub.mintUrl();
            stub.cleanDirty();
            const document = yield RDFDocument.fromJsonLD(stub.toJsonLD());
            const turtle = RDFResourceProperty.toTurtle(document.properties, document.url);
            StubFetcher.addFetchResponse(turtle);
        }));
    });
}
