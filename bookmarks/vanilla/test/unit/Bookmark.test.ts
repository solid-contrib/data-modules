import { Bookmark, IBookmark, ICreateBookmark, IUpdateBookmark } from "../../src/modules/Bookmark";
import { Session } from "@inrupt/solid-client-authn-browser";
import inruptClient from "@inrupt/solid-client";
import { readFileSync } from "fs";
import { TypeIndexHelper } from "@rezasoltani/solid-typeindex-support";
import { allBookmarksMock } from "./fixtures/allBookmarks.mock";

export function loadFixture<T = string>(name: string): T {
    const raw = readFileSync(`${__dirname}/fixtures/${name}`).toString();

    return /\.json(ld)$/.test(name) ? JSON.parse(raw) : raw;
}

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
    jest.restoreAllMocks()
    session.fetch.mockReset();
    session.login.mockReset();
    session.logout.mockReset();
});


describe("Bookmark", () => {

    it("The getIndexUrl method should return index url with registry exists in typeIndex", async () => {
        const podUrls = ["https://fake-pod.net/"];
        const expectedIndexUrl = ["https://fake-pod.net/bookmarks/index.ttl"];

        const instances = ["https://fake-pod.net/bookmarks/index.ttl"]

        jest.spyOn(TypeIndexHelper, "getFromTypeIndex").mockReturnValue(Promise.resolve({ instanceContainers: [], instances }));
        jest.spyOn(inruptClient, "getPodUrlAll").mockReturnValue(Promise.resolve(podUrls));

        const res = await Bookmark.getAllBookmarkDocUrls(session.fetch, session.info.webId!);

        expect(inruptClient.getPodUrlAll).toHaveBeenCalledTimes(0);

        expect(res).toStrictEqual(expectedIndexUrl);
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

        jest.spyOn(Bookmark, "getAllBookmarkDocUrls").mockReturnValue(Promise.resolve(defaultBookmarksDocUrl));

        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseObject));

        const res = await Bookmark.getAll(session.fetch, session.info.webId!);

        expect(Bookmark.getAllBookmarkDocUrls).toHaveBeenCalled();

        expect(res).toEqual(expected);

    });

    it("the delete method should delete bookmark", async () => {
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

        jest.spyOn(Bookmark, "getAllBookmarkDocUrls").mockReturnValue(Promise.resolve(defaultBookmarksDocUrl));

        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseGet));
        jest.spyOn(inruptClient, "getThing").mockReturnValue(JSON.parse(loadFixture("things/one.json")));
        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseDelete));

        const res = await Bookmark.delete(url, session.fetch);

        expect(res).toEqual(true);
    });

    it("the create method should create bookmark", async () => {
        const payload: ICreateBookmark = {
            title: "new",
            link: "http://new.com",
            creator: "https://michielbdejong.solidcommunity.net/profile/card#me",
        }

        const defaultBookmarksDocUrl = ["https://fake-pod.net/path/to/bookmark-formats.ttl"];

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

        jest.spyOn(Bookmark, "getAllBookmarkDocUrls").mockReturnValue(Promise.resolve(defaultBookmarksDocUrl));

        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseGet));

        jest.spyOn(inruptClient, "setThing").mockReturnValue(JSON.parse(loadFixture("ds-with-new.json")));

        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseCreate));

        const res = await Bookmark.create(payload, session.fetch, session.info.webId!);

        expect(Bookmark.getAllBookmarkDocUrls).toHaveBeenCalled();

        expect(res).toEqual(true);

    });
    it("the update method should update bookmark", async () => {

        const payload: IUpdateBookmark = {
            title: "updated",
            link: "http://updated.com",
            creator: "https://michielbdejong.solidcommunity.net/profile/card#me",
        }

        const url = 'https://fake-pod.net/path/to/bookmark-formats.ttl#one';

        const expected = {
            url: 'https://fake-pod.net/path/to/bookmark-formats.ttl#one',
            title: 'updated',
            link: 'http://updated.com',
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

        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseGet));

        jest.spyOn(inruptClient, "setThing").mockReturnValue(JSON.parse(loadFixture("ds-with-updated.json")));

        const res = await Bookmark.update(url, payload, session.fetch);


        expect(res?.title).toEqual(expected.title);
        expect(res?.link).toEqual(expected.link);
        expect(res?.creator).toEqual(expected.creator);

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

        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseObject));

        const res = await Bookmark.get(url, session.fetch);


        expect(res).toEqual(expected);

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

        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseObject));

        const res = await Bookmark.get(url, session.fetch);

        expect(res).toEqual(expected);
    });

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

        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseObject));

        const res = await Bookmark.get(url, session.fetch);


        expect(res).toEqual(expected);
    });
    it("should parse bookmarks created with soukai", async () => {
        const url = 'https://fake-pod.ne/bookmarks/b93d9944-d54d-42f6-a39b-6ea3f9217763';

        const expected = {
            url: 'https://fake-pod.ne/bookmarks/b93d9944-d54d-42f6-a39b-6ea3f9217763',
            title: 'sdf',
            link: 'http://example.com',
            created: '2023-11-21T12:50:32.051Z',
            updated: '2023-11-21T12:50:32.051Z'
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

        jest.spyOn(session, "fetch").mockReturnValue(Promise.resolve(responseObject));

        const res = await Bookmark.get(url, session.fetch);


        expect(res).toEqual(expected);
    });
    it("should throw and Error if link is not a valid URL", async () => {
        const payload: ICreateBookmark = {
            title: "new",
            link: "not valid url",
            creator: "https://michielbdejong.solidcommunity.net/profile/card#me",
        }

        try {
            await Bookmark.create(payload, session.fetch, session.info.webId!);
        } catch (e: any) {
            expect(e.message).toBe("link is not a valid URL");
        }
    });
    it("should throw and Error if creator is not a valid URL", async () => {
        const payload: ICreateBookmark = {
            title: "new",
            link: "http://test.com",
            creator: "non valid creator",
        }

        try {
            await Bookmark.create(payload, session.fetch, session.info.webId!);
        } catch (e: any) {
            expect(e.message).toBe("creator is not a valid URL");
        }
    });
});
