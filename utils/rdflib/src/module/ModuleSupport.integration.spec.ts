import { ModuleSupport } from "./ModuleSupport";

import { Fetcher, graph, lit, sym, UpdateManager } from "rdflib";
import { mockLdpContainer, mockTurtleDocument } from "../test-support";

jest.mock("../identifier");

function givenModuleSupport() {
  const authenticatedFetch = jest.fn();

  const store = graph();
  const fetcher = new Fetcher(store, {
    fetch: authenticatedFetch,
  });
  const updater = new UpdateManager(store);
  const support = new ModuleSupport({
    store,
    fetcher,
    updater,
  });
  return { authenticatedFetch, store, support };
}

describe("ModuleSupport", () => {
  it("fetches a node and adds the triples to the store", async () => {
    const { authenticatedFetch, store, support } = givenModuleSupport();

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/test.ttl",
      `<> <https://schema.org/name> "Test" .`,
    );

    await support.fetchNode(sym("https://pod.test/test.ttl"));

    expect(
      store.holds(
        sym("https://pod.test/test.ttl"),
        sym("https://schema.org/name"),
        lit("Test"),
        sym("https://pod.test/test.ttl"),
      ),
    ).toBe(true);
  });

  it("fetches many nodes and adds all the triples to the store", async () => {
    const { authenticatedFetch, store, support } = givenModuleSupport();

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/doc1.ttl",
      `<> <https://schema.org/name> "Doc 1" .`,
    );

    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/doc2.ttl",
      `<> <https://schema.org/name> "Doc 2" .`,
    );

    await support.fetchAll([
      sym("https://pod.test/doc1.ttl"),
      sym("https://pod.test/doc2.ttl"),
    ]);

    expect(
      store.holds(
        sym("https://pod.test/doc1.ttl"),
        sym("https://schema.org/name"),
        lit("Doc 1"),
        sym("https://pod.test/doc1.ttl"),
      ),
    ).toBe(true);

    expect(
      store.holds(
        sym("https://pod.test/doc2.ttl"),
        sym("https://schema.org/name"),
        lit("Doc 2"),
        sym("https://pod.test/doc2.ttl"),
      ),
    ).toBe(true);
  });

  describe("discoverType", () => {
    describe("given registrations in public type index", () => {
      it("returns all instances and containers from that index", async () => {
        const { authenticatedFetch, support } = givenModuleSupport();

        mockTurtleDocument(
          authenticatedFetch,
          "https://pod.test/alice/profile/card",
          `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
  
    <#me> a vcard:Individual;
        vcard:fn "Alice";
        solid:publicTypeIndex <https://pod.test/alice/settings/publicTypeIndex.ttl> ;
        .
`,
        );

        mockTurtleDocument(
          authenticatedFetch,
          "https://pod.test/alice/settings/publicTypeIndex.ttl",
          `
    @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
    @prefix ex: <http://vocab.example#>.
  
    <#registration-1> a solid:TypeRegistration ;
       solid:forClass ex:Something ;
       solid:instance <https://pod.test/alice/something/1/index.ttl#this>, <https://pod.test/alice/something/2/index.ttl#this> ;
       .
       
     <#registration-2> a solid:TypeRegistration ;
       solid:forClass ex:Something ;
       solid:instanceContainer <https://pod.test/alice/things/> ;
       .
`,
        );

        const result = await support.discoverType(
          sym("https://pod.test/alice/profile/card#me"),
          sym("http://vocab.example#Something"),
        );

        expect(result.private).toEqual({
          instances: [],
          instanceContainers: [],
        });

        expect(result.public).toEqual({
          instances: [
            sym("https://pod.test/alice/something/1/index.ttl#this"),
            sym("https://pod.test/alice/something/2/index.ttl#this"),
          ],
          instanceContainers: [sym("https://pod.test/alice/things/")],
        });
      });
    });
  });

  describe("isContainer", () => {
    it("returns true if url refers to a container", async () => {
      const { authenticatedFetch, support } = givenModuleSupport();

      mockLdpContainer(authenticatedFetch, "https://pod.test/container/");

      const result = await support.isContainer("https://pod.test/container/");
      expect(result).toBe(true);
    });

    it("returns false if url refers to a document", async () => {
      const { authenticatedFetch, support } = givenModuleSupport();

      mockTurtleDocument(authenticatedFetch, "https://pod.test/document", "");

      const result = await support.isContainer("https://pod.test/document");
      expect(result).toBe(false);
    });
  });
});
