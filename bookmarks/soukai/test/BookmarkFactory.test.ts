import { TypeIndexHelper } from '@rezasoltani/solid-typeindex-support';
import { Bookmark, BookmarkFactory } from '../src/modules/Bookmarks';
import { readFileSync } from 'fs';
import { SolidEngine } from 'soukai-solid';
import { bootModels, setEngine } from 'soukai';
import stubFetcher from 'soukai-solid-utils/dist/StubFetcher';

const WEB_ID = 'https://fake-pod.net/profile/card#me';
const DEFAULT_CONTAINER_URL = 'https://fake-pod.com/bookmarks/'

const google_bookmark = {
    title: "Google",
    topic: "Search Engine",
    link: "https://google.com",
    creator: "https://solid-dm.solidcommunity.net/profile/card#me",
}

let fetch: jest.Mock<Promise<Response>, [RequestInfo, RequestInit?]>;


beforeEach(() => {
    fetch = jest.fn((...args) => stubFetcher.fetch(...args));

    Bookmark.collection = DEFAULT_CONTAINER_URL;

    setEngine(new SolidEngine(fetch));
    bootModels({ Bookmark: Bookmark });
});

describe('getInstance', () => {
    it('should return existing instance', async () => {
        jest.spyOn(TypeIndexHelper, "getFromTypeIndex").mockResolvedValue({ instanceContainers: [DEFAULT_CONTAINER_URL], instances: [] });

        const factory_1 = await BookmarkFactory.getInstance({ webId: WEB_ID, fetch: fetch, isPrivate: true });
        const factory_2 = await BookmarkFactory.getInstance({ webId: WEB_ID, fetch: fetch, isPrivate: true });

        expect(factory_1).toBe(factory_2);
    });
});



describe('getAll', () => {

});


describe('get', () => {
    it('should get one bookmark given the url', async () => {
        // Arrange
        stubFetcher.addFetchResponse(loadFixture("google.ttl"), { "WAC-Allow": 'public="read"' });

        jest.spyOn(TypeIndexHelper, "getFromTypeIndex").mockResolvedValue({ instanceContainers: [DEFAULT_CONTAINER_URL], instances: [] });

        const factory = await BookmarkFactory.getInstance({ webId: WEB_ID, fetch: fetch, isPrivate: true });

        // Act
        const res = await factory.get('solid://bookmarks/google#it')

        // Assert
        expect(res.title).toEqual(google_bookmark.title);
        expect(res.topic).toEqual(google_bookmark.topic);
        expect(res.link).toEqual(google_bookmark.link);
    });
});

describe('create', () => {
    it('should create a bookmark', async () => {
        // Arrange
        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();

        jest.spyOn(TypeIndexHelper, "getFromTypeIndex").mockResolvedValue({ instanceContainers: [DEFAULT_CONTAINER_URL], instances: [] });

        const factory = await BookmarkFactory.getInstance({ webId: WEB_ID, fetch: fetch, isPrivate: true });

        // Act
        const res = await factory.create(google_bookmark)

        // Assert
        expect(res.title).toEqual(google_bookmark.title);
        expect(res.topic).toEqual(google_bookmark.topic);
        expect(res.link).toEqual(google_bookmark.link);
    });
});
describe('update', () => {
    it('should update a bookmark', async () => {
        // Arrange
        jest.spyOn(TypeIndexHelper, "getFromTypeIndex").mockResolvedValue({ instanceContainers: [DEFAULT_CONTAINER_URL], instances: [] });

        const factory = await BookmarkFactory.getInstance({ webId: WEB_ID, fetch: fetch, isPrivate: true });

        // Act
        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();
        const res = await factory.create(google_bookmark)

        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();
        const updated = await res.update({
            ...res.getAttributes(),
            title: "UPDATED"
        })

        // Assert
        expect(updated.title).toEqual("UPDATED");
        expect(updated.topic).toEqual(google_bookmark.topic);
        expect(updated.link).toEqual(google_bookmark.link);
    });
});
describe('remove', () => {
    it('should remove a bookmark', async () => {
        // Arrange
        jest.spyOn(TypeIndexHelper, "getFromTypeIndex").mockResolvedValue({ instanceContainers: [DEFAULT_CONTAINER_URL], instances: [] });

        const factory = await BookmarkFactory.getInstance({ webId: WEB_ID, fetch: fetch, isPrivate: true });

        // Act
        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();
        const res = await factory.create(google_bookmark)

        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();
        const deleted = await res.delete()

        // Assert
        expect(deleted).toBeDefined();
    });
});


afterEach(() => {
    jest.restoreAllMocks()
});


function loadFixture<T = string>(name: string): T {
    const raw = readFileSync(`${__dirname}/fixtures/${name}`).toString();
    return /\.json(ld)$/.test(name) ? JSON.parse(raw) : raw;
}