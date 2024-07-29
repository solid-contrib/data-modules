import { ContainerQuery } from "./ContainerQuery";
import { graph, parse, sym } from "rdflib";

describe(ContainerQuery.name, () => {
  describe("queryContents", () => {
    it("returns nothing if store is empty", () => {
      const store = graph();
      const result = new ContainerQuery(
        sym("https://pod.test/container/"),
        store,
      ).queryContents();
      expect(result).toEqual([]);
    });

    it("returns a single document", () => {
      const store = graph();
      parse(
        `
      @prefix ldp: <http://www.w3.org/ns/ldp#> .
      <> a ldp:Container ;
         ldp:contains <a> .
      
      `,
        store,
        "https://pod.test/container/",
      );
      const result = new ContainerQuery(
        sym("https://pod.test/container/"),
        store,
      ).queryContents();
      expect(result).toEqual([sym("https://pod.test/container/a")]);
    });

    it("returns only named nodes", () => {
      const store = graph();
      parse(
        `
      @prefix ldp: <http://www.w3.org/ns/ldp#> .
      <> a ldp:Container ;
         ldp:contains <a>, <b>, "c", 5 .
      
      `,
        store,
        "https://pod.test/container/",
      );
      const result = new ContainerQuery(
        sym("https://pod.test/container/"),
        store,
      ).queryContents();
      expect(result).toEqual([
        sym("https://pod.test/container/a"),
        sym("https://pod.test/container/b"),
      ]);
    });

    it("returns only named nodes form original container", () => {
      const store = graph();
      parse(
        `
      @prefix ldp: <http://www.w3.org/ns/ldp#> .
      <> a ldp:Container ;
         ldp:contains <a>, <b> .
      
      `,
        store,
        "https://pod.test/container/",
      );

      parse(
        `
      @prefix ldp: <http://www.w3.org/ns/ldp#> .
      <https://pod.test/container/> a ldp:Container ;
         ldp:contains <c>, <d> .
      
      `,
        store,
        "https://pod.test/other/",
      );
      const result = new ContainerQuery(
        sym("https://pod.test/container/"),
        store,
      ).queryContents();
      expect(result).toEqual([
        sym("https://pod.test/container/a"),
        sym("https://pod.test/container/b"),
      ]);
    });
  });
});
