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
