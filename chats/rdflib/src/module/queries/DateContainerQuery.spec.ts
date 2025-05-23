import { DateContainerQuery } from "./DateContainerQuery";
import { graph, parse, sym } from "rdflib";

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

    it("returns the container name with the latest year number", () => {
      const store = graph();

      parse(
        `
      @prefix ldp: <http://www.w3.org/ns/ldp#>.
      
      <> ldp:contains  <2022/>, <2024/>, <2023/>.
      
  
      <2022/> a ldp:Container .
      <2024/> a ldp:Container .
      <2023/> a ldp:Container .
      `,
        store,
        "https://pod.test/container/",
      );

      const result = new DateContainerQuery(
        sym("https://pod.test/container/"),
        store,
      ).queryLatest();
      expect(result).toEqual(sym("https://pod.test/container/2024/"));
    });

    it("returns the container name with the month / day number", () => {
      const store = graph();

      parse(
        `
      @prefix ldp: <http://www.w3.org/ns/ldp#>.
      
      <> ldp:contains  <05/>, <08/>, <06/>.
      
  
      <05/> a ldp:Container .
      <08/> a ldp:Container .
      <06/> a ldp:Container .
      `,
        store,
        "https://pod.test/container/2024/",
      );

      const result = new DateContainerQuery(
        sym("https://pod.test/container/2024/"),
        store,
      ).queryLatest();
      expect(result).toEqual(sym("https://pod.test/container/2024/08/"));
    });
  });
});
