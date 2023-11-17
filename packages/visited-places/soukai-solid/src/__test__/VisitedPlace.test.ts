import { RDFDocument, RDFResourceProperty } from "soukai-solid-utils";
import {} from "soukai-solid-utils";
import { tap } from "@noeldemartin/utils";
import { readFileSync } from "fs";
import { bootModels, setEngine } from "soukai";
import { SolidEngine } from "soukai-solid";
import { VisitedPlace } from "../modules/VisitedPlace";
import StubFetcher from "../testing/StubFetcher";

export function loadFixture<T = string>(name: string): T {
  const raw = readFileSync(`${__dirname}/fixtures/${name}`).toString();

  return /\.json(ld)$/.test(name) ? JSON.parse(raw) : raw;
}

const fixture = (name: string) => loadFixture(`myvisitedplaces/${name}`);

describe("VisitedPlace CRUD", () => {
  let fetch: jest.Mock<Promise<Response>, [RequestInfo, RequestInit?]>;

  beforeEach(() => {
    fetch = jest.fn((...args) => StubFetcher.fetch(...args));
    VisitedPlace.collection = "https://fake-pod.com/myvisitedplaces/";

    setEngine(new SolidEngine(fetch));
    bootModels({
      VisitedPlace: VisitedPlace,
    });
  });

  //   it("Read Country", async () => {
  //     const netherlands = "http://dbpedia.org/resource/Netherlands";
  //     const placeType = "Country";

  //     // Arrange
  //     StubFetcher.addFetchResponse(fixture("index.ttl"), {
  //       "WAC-Allow": 'public="read"',
  //     });

  //     // Act
  //     const visitedPlace = (await VisitedPlace.find(
  //       "solid://myvisitedplaces/index#it"
  //     )) as VisitedPlace;

  //     // Assert
  //     expect(visitedPlace).toBeInstanceOf(VisitedPlace);
  //     expect(visitedPlace.url).toEqual("solid://myvisitedplaces/index#it");
  //     expect(visitedPlace.country).toEqual(netherlands);
  //     expect(visitedPlace.placeType).toEqual(placeType);
  //   });

  //   it("Create Country", async () => {
  //     // Arrange
  //     const country = "http://dbpedia.org/resource/Netherlands";
  //     const placeType = "Country";
  //     const description = "Nide country to live in";
  //     const startDate = "2023-11-09";

  //     const date = new Date("2023-01-01:00:00Z");

  //     StubFetcher.addFetchResponse();
  //     StubFetcher.addFetchResponse();

  //     // // Act
  //     const visitedPlace = new VisitedPlace({
  //       country,
  //       placeType,
  //       description,
  //       startDate,
  //     });

  //     visitedPlace.metadata.createdAt = date;
  //     visitedPlace.metadata.updatedAt = date;

  //     await visitedPlace.save();

  //     // // Assert
  //     expect(fetch).toHaveBeenCalledTimes(2);
  //     // console.log("🚀 ~ file: VisitedPlace.test.ts:80 ~ it ~ fetch.mock.calls[1]?.[1]?.body:", fetch.mock.calls[1]?.[1]?.body)
  //     expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql(`
  //         INSERT DATA {
  //             <#it> a <http://generativeobjects.com/apps#VisitedPlace> .
  //             <#it> <http://dbpedia.org/class/yago/WikicatMemberStatesOfTheUnitedNations> <http://dbpedia.org/resource/Netherlands> .
  //             <#it> <http://generativeobjects.com/apps#VisitedPlaceType> "Country" .
  //             <#it> <https://schema.org/description> "Nide country to live in" .
  //             <#it> <https://schema.org/startDate> "2023-11-09" .
  //             <#it-metadata> a <https://vocab.noeldemartin.com/crdt/Metadata> .
  //             <#it-metadata> <https://vocab.noeldemartin.com/crdt/createdAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
  //             <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> .
  //             <#it-metadata> <https://vocab.noeldemartin.com/crdt/updatedAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
  //         }
  //       `);
  //   });

  it("Update", async () => {
    const country = "http://dbpedia.org/resource/Netherlands";
    const placeType = "Country";
    const description = "Nide country to live in";
    const startDate = "2023-11-09";

    const date = new Date("2023-01-01:00:00Z");

    // // Arrange
    const stub = await createStub({
      country,
      placeType,
      description,
      startDate,
    });

    const visitedPlace = new VisitedPlace(stub.getAttributes(), true);

    StubFetcher.addFetchResponse();

    // // // Act
    visitedPlace.setAttribute("country", country);
    visitedPlace.setAttribute("description", description);

    visitedPlace.metadata.createdAt = date;
    visitedPlace.metadata.updatedAt = date;

    const res = await visitedPlace.save();

    // // // Assert
    expect(visitedPlace.country).toBe(country);
    expect(fetch).toHaveBeenCalledTimes(2);

    // console.log("🚀 ~ file: VisitedPlace.test.ts:128 ~ it ~ fetch.mock.calls[1]?.[1]?.body:", fetch.mock.calls[1]?.[1]?.body)
    expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql(`
        DELETE DATA {
            <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> .
        } ;
        INSERT DATA {
            <#it-metadata> a <https://vocab.noeldemartin.com/crdt/Metadata> .
            <#it-metadata> <https://vocab.noeldemartin.com/crdt/createdAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
            <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> .
            <#it-metadata> <https://vocab.noeldemartin.com/crdt/updatedAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        }
      `);
  });
});

async function createStub(attributes: {
  country: string;
  placeType: string;
  description: string;
  startDate: string;
}): Promise<VisitedPlace> {
  return tap(new VisitedPlace(attributes, true), async (stub) => {
    stub.mintUrl();
    stub.cleanDirty();

    const document = await RDFDocument.fromJsonLD(stub.toJsonLD());
    const turtle = RDFResourceProperty.toTurtle(
      document.properties,
      document.url
    );

    StubFetcher.addFetchResponse(turtle);
  });
}
