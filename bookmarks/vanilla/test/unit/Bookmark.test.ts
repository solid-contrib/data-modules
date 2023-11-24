import { Bookmark } from "../../src/modules/Bookmark";
import { Session } from "@inrupt/solid-client-authn-browser";
import inruptClient from "@inrupt/solid-client";
import { readFileSync } from "fs";

export function loadFixture<T = string>(name: string): T {
    const raw = readFileSync(`${__dirname}/fixtures/${name}`).toString();

    return /\.json(ld)$/.test(name) ? JSON.parse(raw) : raw;
}


describe("Bookmark", () => {
    let session: jest.Mocked<Session>;

    beforeEach(() => {

        session = {
            fetch: jest.fn(),
            info: {
                webId: "https://fake-pod.net/profile/card#me",
                isLoggedIn: true,
                sessionId: "123",
                clientAppId: "https://clientAppId.com",
                expirationDate: new Date().getDate() + 1000000000,
            },
            logout: jest.fn(),
            login: jest.fn(),
        } as unknown as jest.Mocked<Session>;
    });

    // TODO: Improve existing tests to mock fetch and not getSolidDataset etc
    // See https://github.com/solid-contrib/data-modules/issues/23
    
    it("should return index url", async () => {
        const podUrls = ["https://fake-pod.net/"];
        const typeIndexUrl = "https://fake-pod.net/bookmarks/index.ttl";

        jest.spyOn(inruptClient, "getPodUrlAll").mockReturnValue(Promise.resolve(podUrls));

        const res = await Bookmark.getIndexUrl(session);

        expect(inruptClient.getPodUrlAll).toHaveBeenCalled();

        expect(res).toBe(typeIndexUrl);
    });

    it("should get all bookmarks", async () => {
        const typeIndexUrl = "https://fake-pod.net/bookmarks/index.ttl";

        const expected = [
            {
                url: 'https://fake-pod.net/bookmarks/index.ttl#d2d50f70-8eb0-40b6-9996-88c4a430a16d',
                title: 'updated',
                link: 'http://goo.com'
            }
        ]

        jest.spyOn(Bookmark, "getIndexUrl").mockReturnValue(Promise.resolve(typeIndexUrl));

        jest.spyOn(inruptClient, "getSolidDataset").mockReturnValue(Promise.resolve(JSON.parse(loadFixture("ds.json"))));

        const res = await Bookmark.getAll(session);

        expect(Bookmark.getIndexUrl).toHaveBeenCalled();

        expect(res).toEqual(expected);
    });
    it("should get one bookmark", async () => {
        const typeIndexUrl = "https://fake-pod.net/bookmarks/index.ttl";
        const url = 'https://fake-pod.net/bookmarks/index.ttl#d2d50f70-8eb0-40b6-9996-88c4a430a16d';

        const expected = {
            url: 'https://fake-pod.net/bookmarks/index.ttl#d2d50f70-8eb0-40b6-9996-88c4a430a16d',
            title: 'updated',
            link: 'http://goo.com'
        }

        jest.spyOn(Bookmark, "getIndexUrl").mockReturnValue(Promise.resolve(typeIndexUrl));

        jest.spyOn(inruptClient, "getSolidDataset").mockReturnValue(Promise.resolve(JSON.parse(loadFixture("ds.json"))));

        const res = await Bookmark.get(url, session);

        expect(Bookmark.getIndexUrl).toHaveBeenCalled();

        expect(res).toEqual(expected);
    });
    it("should delete bookmark", async () => {
        const typeIndexUrl = "https://fake-pod.net/bookmarks/index.ttl";
        const url = 'https://fake-pod.net/bookmarks/index.ttl#d2d50f70-8eb0-40b6-9996-88c4a430a16d';

        const expected = [{
            url: 'https://fake-pod.net/bookmarks/index.ttl#d2d50f70-8eb0-40b6-9996-88c4a430a16d',
            title: 'updated',
            link: 'http://goo.com'
        }]

        jest.spyOn(Bookmark, "getIndexUrl").mockReturnValue(Promise.resolve(typeIndexUrl));

        jest.spyOn(inruptClient, "getSolidDataset").mockReturnValue(Promise.resolve(JSON.parse(loadFixture("ds.json"))));
        // TODO: this should return updated ds
        // We are not testing saveSolidDatasetAt but its good to have nice mocks
        jest.spyOn(inruptClient, "saveSolidDatasetAt").mockReturnValue(Promise.resolve(JSON.parse(loadFixture("ds.json"))));

        const res = await Bookmark.delete(url, session);

        expect(Bookmark.getIndexUrl).toHaveBeenCalled();

        expect(res).toEqual(expected);
    });
    it("should create bookmark", async () => {

        const title = "updated";
        const link = "http://goo.com";


        const typeIndexUrl = "https://fake-pod.net/bookmarks/index.ttl";
        // const url = 'https://fake-pod.net/bookmarks/index.ttl#d2d50f70-8eb0-40b6-9996-88c4a430a16d';

        const expected = [{
            url: 'https://fake-pod.net/bookmarks/index.ttl#d2d50f70-8eb0-40b6-9996-88c4a430a16d',
            title: 'updated',
            link: 'http://goo.com'
        }]

        jest.spyOn(Bookmark, "getIndexUrl").mockReturnValue(Promise.resolve(typeIndexUrl));
        jest.spyOn(inruptClient, "getSolidDataset").mockReturnValue(Promise.resolve(JSON.parse(loadFixture("ds.json"))));
        jest.spyOn(inruptClient, "saveSolidDatasetAt").mockReturnValue(Promise.resolve(JSON.parse(loadFixture("ds.json"))));

        const res = await Bookmark.create(title, link, session);

        expect(Bookmark.getIndexUrl).toHaveBeenCalled();

        expect(res).toEqual(expected);
    });
    it("should update bookmark", async () => {

        const title = "updated";
        const link = "http://goo.com";


        const typeIndexUrl = "https://fake-pod.net/bookmarks/index.ttl";
        const url = 'https://fake-pod.net/bookmarks/index.ttl#d2d50f70-8eb0-40b6-9996-88c4a430a16d';

        const expected = [{
            url: 'https://fake-pod.net/bookmarks/index.ttl#d2d50f70-8eb0-40b6-9996-88c4a430a16d',
            title: 'updated',
            link: 'http://goo.com'
        }]

        jest.spyOn(Bookmark, "getIndexUrl").mockReturnValue(Promise.resolve(typeIndexUrl));
        jest.spyOn(inruptClient, "getSolidDataset").mockReturnValue(Promise.resolve(JSON.parse(loadFixture("ds.json"))));
        jest.spyOn(inruptClient, "saveSolidDatasetAt").mockReturnValue(Promise.resolve(JSON.parse(loadFixture("ds.json"))));

        const res = await Bookmark.update(url, title, link, session);

        expect(Bookmark.getIndexUrl).toHaveBeenCalled();

        expect(res).toEqual(expected);
    });
    it("should parse bookmarks in format one", async () => {
        const indexUrl = "https://fake-pod.net/bookmarks/index.ttl";

        const url = 'https://fake-pod.net/bookmarks/bookmark-formats.ttl#one';

        const expected = {
            url: 'https://fake-pod.net/bookmarks/bookmark-formats.ttl#one',
            title: 'one',
            link: 'http://example.com',
            created: '2023-10-21T14:16:16Z',
            updated: '2023-11-21T14:16:16Z',
            creator: 'https://michielbdejong.solidcommunity.net/profile/card#me'
        }

        const responseObject: any = {
            status: 200,
            ok: true,
            headers: {
                get: (h: string) => (h == "Content-Type" ? "text/turtle" : undefined)
            },
            text: () => {
                return Promise.resolve(loadFixture("bookmark-formats.ttl"));
            }
        };

        jest.spyOn(Bookmark, "getIndexUrl").mockReturnValue(Promise.resolve(indexUrl));

        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseObject));
        jest.spyOn(inruptClient, "getThing").mockReturnValue(JSON.parse(loadFixture("things/one.json")));

        const res = await Bookmark.get(url, session);

        expect(Bookmark.getIndexUrl).toHaveBeenCalled();

        expect(res).toEqual(expected);

    });
    it("should parse bookmarks in format two", async () => {
        // etc
    });
});
