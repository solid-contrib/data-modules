import { tap } from "@noeldemartin/utils";
import { readFileSync } from "fs";
import { bootModels, setEngine } from "soukai";
import { SolidEngine } from "soukai-solid";
import { Bookmark } from "../src/modules/Bookmarks";
import stubFetcher from 'soukai-solid-utils/dist/StubFetcher'
import { RDFDocument, RDFResourceProperty } from 'soukai-solid-utils'


export function loadFixture<T = string>(name: string): T {
  const raw = readFileSync(`${__dirname}/fixtures/${name}`).toString();

  return /\.json(ld)$/.test(name) ? JSON.parse(raw) : raw;
}


describe("Bookmark CRUD", () => {
  let fetch: jest.Mock<Promise<Response>, [RequestInfo, RequestInit?]>;

  beforeEach(() => {
    fetch = jest.fn((...args) => stubFetcher.fetch(...args));
    Bookmark.collection = "https://fake-pod.com/bookmarks/";

    setEngine(new SolidEngine(fetch));
    bootModels({
      Bookmark: Bookmark,
    });
  });

  it("Create", async () => {
    // Arrange
    const title = "Google";
    const topic = "Search Engine";
    const link = "https://google.com";
    const creator = "https://solid-dm.solidcommunity.net/profile/card#me";

    // const date = new Date("2023-01-01:00:00Z");

    stubFetcher.addFetchResponse();
    stubFetcher.addFetchResponse();

    // Act
    const bookmark = new Bookmark({ title, topic, link, creator });

    const res = await bookmark.save();

    // Assert
    expect(res.title).toEqual(title);
    expect(res.topic).toEqual(topic);
    expect(res.link).toEqual(link);

    expect(fetch).toHaveBeenCalledTimes(2);
    // console.log("🚀 ~ file: Bookmark.test.ts:64 ~ it ~ fetch.mock.calls[1]?.[1]?.body:", fetch.mock.calls[1]?.[1]?.body)

    expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql(`
      INSERT DATA { 
        <#it> a <http://www.w3.org/2002/01/bookmark#Bookmark> .
        <#it> <http://purl.org/dc/terms/creator> <https://solid-dm.solidcommunity.net/profile/card#me> .
        <#it> <http://purl.org/dc/terms/title> "Google" .
        <#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://google.com> . 
      }
    `);
  });

  it("Read", async () => {
    const title = "Google";
    const topic = "Search Engine";
    const link = "https://google.com";

    // Arrange
    stubFetcher.addFetchResponse(loadFixture("google.ttl"), {
      "WAC-Allow": 'public="read"',
    });

    // Act
    const bookmark = (await Bookmark.find(
      "solid://bookmarks/google#it"
    )) as Bookmark;

    // Assert
    expect(bookmark).toBeInstanceOf(Bookmark);
    expect(bookmark.url).toEqual("solid://bookmarks/google#it");
    expect(bookmark.title).toEqual(title);
    expect(bookmark.topic).toEqual(topic);
    expect(bookmark.link).toEqual(link);
  });

  it("Update", async () => {
    const title = "Google";
    const topic = "Search Engine";
    const link = "https://google.com";

    // Arrange
    const stub = await createStub({
      title,
      link,
      topic,
    });

    const bookmark = new Bookmark(stub.getAttributes(), true);

    stubFetcher.addFetchResponse();

    // // Act
    bookmark.setAttribute("title", title);
    bookmark.setAttribute("link", link);
    bookmark.setAttribute("topic", topic);

    await bookmark.save();


    await bookmark.update({
      ...bookmark.getAttributes(),
      title: "updated"
    });

    // // Assert
    expect(fetch).toHaveBeenCalledTimes(2);

    expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql(`
      DELETE DATA { 
        <#it> <http://purl.org/dc/terms/title> "Google" .
      } ; 
      INSERT DATA { 
        <#it> <http://purl.org/dc/terms/title> "updated" .
      }
    `);
  });
});

async function createStub(attributes: {
  title: string;
  link: string;
  topic: string;
}): Promise<Bookmark> {
  return tap(new Bookmark(attributes, true), async (stub) => {
    stub.mintUrl();
    stub.cleanDirty();

    const document = await RDFDocument.fromJsonLD(stub.toJsonLD());
    const turtle = RDFResourceProperty.toTurtle(
      document.properties,
      document.url
    );

    stubFetcher.addFetchResponse(turtle);
  });
}