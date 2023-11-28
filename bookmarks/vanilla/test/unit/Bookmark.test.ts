import { Bookmark, IBookmark, ICreateBookmark, IUpdateBookmark } from "../../src/modules/Bookmark";
import { Session } from "@inrupt/solid-client-authn-browser";
import inruptClient from "@inrupt/solid-client";
import { readFileSync } from "fs";
import { TypeIndexHelper } from "../../src/utils/TypeIndexHelper";
import { allBookmarksMock } from "./fixtures/allBookmarks.mock";

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

    afterEach(() => {
        session.fetch.mockReset();
        session.login.mockReset();
        session.logout.mockReset();
    });

    // TODO: Improve existing tests to mock fetch and not getSolidDataset etc
    // See https://github.com/solid-contrib/data-modules/issues/23

    it("The getIndexUrl method should return index url with registery exists in typeIndex", async () => {
        const podUrls = ["https://fake-pod.net/"];
        const expectedIndexUrl = ["https://fake-pod.net/bookmarks/index.ttl"];

        const registeries = {
            instances: ["https://fake-pod.net/bookmarks/index.ttl"],
            instanceContainers: ["https://fake-pod.net/bookmarks/"]
        }

        const mockBookmarkRegisteries = jest.spyOn(TypeIndexHelper, "getFromTypeIndex").mockReturnValue(Promise.resolve(registeries));
        const mockGetPodUrlAll = jest.spyOn(inruptClient, "getPodUrlAll").mockReturnValue(Promise.resolve(podUrls));

        const res = await Bookmark.getIndexUrl(session);

        expect(inruptClient.getPodUrlAll).toHaveBeenCalledTimes(0);

        expect(res).toStrictEqual(expectedIndexUrl);
        mockBookmarkRegisteries.mockRestore();
        mockGetPodUrlAll.mockRestore();
    });

    it("the getAll method should get all bookmarks", async () => {
        const defaultBookmarksDocUrl = ["https://fake-pod.net/path/to/bookmark.ttl"];

        const expected: IBookmark[] = allBookmarksMock

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

        const mockGetIndexUrl = jest.spyOn(Bookmark, "getIndexUrl").mockReturnValue(Promise.resolve(defaultBookmarksDocUrl));

        const mockFetch = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseObject));

        const res = await Bookmark.getAll(session);

        expect(Bookmark.getIndexUrl).toHaveBeenCalled();

        expect(res).toEqual(expected);

        mockGetIndexUrl.mockRestore();
        mockFetch.mockRestore();
    });

    it("the delete function should delete bookmark", async () => {
        const defaultBookmarksDocUrl = ["https://fake-pod.net/path/to/bookmark-formats.ttl"];
        const url = 'https://fake-pod.net/path/to/bookmark-formats.ttl#:one';

        const responseGet: any = {
            status: 200,
            ok: true,
            headers: {
                get: (h: string) => (h == "Content-Type" ? "text/turtle" : undefined)
            },
            text: () => {
                return Promise.resolve(loadFixture("bookmark-formats.ttl"));
            }
        };

        const responseDelete = {
            ...responseGet,
            text: () => {
                return Promise.resolve(loadFixture("bookmark-formats-without-one.ttl"));
            }
        }

        const mockGetIndexUrl = jest.spyOn(Bookmark, "getIndexUrl").mockReturnValue(Promise.resolve(defaultBookmarksDocUrl));

        const mockFetchGet = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseGet));
        const mockGetThing = jest.spyOn(inruptClient, "getThing").mockReturnValue(JSON.parse(loadFixture("things/one.json")));
        const mockFetchDelete = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseDelete));

        const res = await Bookmark.delete(url, session);

        expect(res).toEqual(true);
        mockGetIndexUrl.mockRestore();
        mockFetchGet.mockRestore();
        mockGetThing.mockRestore();
        mockFetchDelete.mockRestore();
    });

    it("the create function should create bookmark", async () => {
        const payload: ICreateBookmark = {
            title: "new",
            link: "http://new.com",
            creator: "https://michielbdejong.solidcommunity.net/profile/card#me",
        }

        const defaultBookmarksDocUrl = ["https://fake-pod.net/path/to/bookmark-formats.ttl"];

        const expected = {
            title: 'new',
            link: 'http://new.com',
            creator: 'https://michielbdejong.solidcommunity.net/profile/card#me'
        }

        const responseGet: any = {
            status: 200,
            ok: true,
            headers: {
                get: (h: string) => (h == "Content-Type" ? "text/turtle" : undefined)
            },
            text: () => {
                return Promise.resolve(loadFixture("bookmark-formats.ttl"));
            }
        };

        const responseCreate = {
            ...responseGet,
            text: () => {
                return Promise.resolve(loadFixture("bookmark-formats-with-new.ttl"));
            }
        }

        const mockGetIndexUrl = jest.spyOn(Bookmark, "getIndexUrl").mockReturnValue(Promise.resolve(defaultBookmarksDocUrl));

        const mockFetchGet = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseGet));

        const mocksetThing = jest.spyOn(inruptClient, "setThing").mockReturnValue(JSON.parse(loadFixture("ds-with-new.json")));

        const mockFetchCreate = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseCreate));

        const res = await Bookmark.create(payload, session);

        expect(Bookmark.getIndexUrl).toHaveBeenCalled();

        expect(res).toEqual(expected);

        mockGetIndexUrl.mockRestore();
        mockFetchGet.mockRestore();
        mocksetThing.mockRestore();
        mockFetchCreate.mockRestore();
    });
    it("the update function should update bookmark", async () => {

        const payload: IUpdateBookmark = {
            title: "updated",
            link: "http://updated.com",
            creator: "https://michielbdejong.solidcommunity.net/profile/card#me",
        }

        const defaultBookmarksDocUrl = ["https://fake-pod.net/path/to/bookmark-formats.ttl"];
        const url = 'https://fake-pod.net/path/to/bookmark-formats.ttl#one';

        const expected = {
            url: 'https://fake-pod.net/path/to/bookmark-formats.ttl#one',
            title: "updated",
            link: "http://updated.com",
            creator: "https://michielbdejong.solidcommunity.net/profile/card#me",
        }

        const responseGet: any = {
            status: 200,
            ok: true,
            headers: {
                get: (h: string) => (h == "Content-Type" ? "text/turtle" : undefined)
            },
            text: () => {
                return Promise.resolve(loadFixture("bookmark-formats.ttl"));
            }
        };

        const responseUpdate = {
            ...responseGet,
            text: () => {
                return Promise.resolve(loadFixture("bookmark-formats-with-updated.ttl"));
            }
        }

        const mock1 = jest.spyOn(Bookmark, "getIndexUrl").mockReturnValue(Promise.resolve(defaultBookmarksDocUrl));

        const mock2 = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseGet));

        const mock3 = jest.spyOn(inruptClient, "setThing").mockReturnValue(JSON.parse(loadFixture("ds-with-updated.json")));

        const res = await Bookmark.update(url, payload, session);

        expect(res).toEqual(expected);

        mock1.mockRestore();
        mock2.mockRestore();
        mock3.mockRestore();
    });
    it("should parse bookmarks in format one", async () => {
        const url = 'https://fake-pod.net/path/to/bookmark-formats.ttl#one';

        const expected = {
            url: 'https://fake-pod.net/path/to/bookmark-formats.ttl#one',
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

        const fetchMock = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseObject));

        const res = await Bookmark.get(url, session);


        expect(res).toEqual(expected);
        fetchMock.mockRestore();

    });
    it("should parse bookmarks in format two", async () => {
        const url = 'https://fake-pod.net/path/to/bookmark-formats.ttl#two';

        const expected = {
            url: 'https://fake-pod.net/path/to/bookmark-formats.ttl#two',
            title: 'two',
            link: 'http://example.com',
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

        const fetchMock = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseObject));

        const res = await Bookmark.get(url, session);

        expect(res).toEqual(expected);
        fetchMock.mockRestore();
    });
    // FIXME: https://github.com/solid-contrib/data-modules/issues/24
    it("should parse bookmarks in format three", async () => {
        const url = 'https://fake-pod.net/path/to/bookmark-formats.ttl#three';

        const expected = {
            url: 'https://fake-pod.net/path/to/bookmark-formats.ttl#three',
            title: 'three',
            link: 'http://example.com',
            topic: 'http://wikipedia.org/sdfg'
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

        const fetchMock = jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseObject));

        const res = await Bookmark.get(url, session);
        
        expect(res).toEqual(expected);
        fetchMock.mockRestore();
    });
});
