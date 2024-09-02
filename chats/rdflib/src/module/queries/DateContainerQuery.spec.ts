import { DateContainerQuery } from "./DateContainerQuery";
import { graph, sym } from "rdflib";

describe(DateContainerQuery.name, () => {
  describe("query latest", () => {
    it("returns null if store is empty", () => {
      const store = graph();
      const result = new DateContainerQuery(
        sym("https://pod.test/container/"),
        store,
      ).queryLatest();
      expect(result).toBe(null);
    });

    it("returns the only container", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/container/"),
        sym("http://www.w3.org/ns/ldp#contains"),
        sym("https://pod.test/container/2024/"),
        sym("https://pod.test/container/"),
      );
      store.add(
        sym("https://pod.test/container/2024/"),
        sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        sym("http://www.w3.org/ns/ldp#Container"),
        sym("https://pod.test/container/"),
      );
      const result = new DateContainerQuery(
        sym("https://pod.test/container/"),
        store,
      ).queryLatest();
      expect(result).toEqual(sym("https://pod.test/container/2024/"));
    });

    it("returns null if all contents are not containers", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/container/"),
        sym("http://www.w3.org/ns/ldp#contains"),
        sym("https://pod.test/container/2024"),
        sym("https://pod.test/container/"),
      );

      const result = new DateContainerQuery(
        sym("https://pod.test/container/"),
        store,
      ).queryLatest();
      expect(result).toEqual(null);
    });
    it("returns null if container type is in wrong document", () => {
      const store = graph();
      store.add(
        sym("https://pod.test/container/"),
        sym("http://www.w3.org/ns/ldp#contains"),
        sym("https://pod.test/container/2024/"),
        sym("https://pod.test/container/"),
      );
      store.add(
        sym("https://pod.test/container/2024/"),
        sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        sym("http://www.w3.org/ns/ldp#Container"),
        sym("https://pod.test/wrong/"),
      );
      const result = new DateContainerQuery(
        sym("https://pod.test/container/"),
        store,
      ).queryLatest();
      expect(result).toEqual(null);
    });
  });
});
