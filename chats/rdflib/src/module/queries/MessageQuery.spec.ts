import { MessageQuery } from "./MessageQuery";
import { graph, parse, sym } from "rdflib";

describe(MessageQuery.name, () => {
  describe("queryMessage", () => {
    it("returns null if store is empty", () => {
      const store = graph();
      const result = new MessageQuery(
        sym("https://pod.test/message#1"),
        store,
      ).queryMessage();
      expect(result).toEqual(null);
    });

    it("returns a complete message", () => {
      const store = graph();
      parse(
        `
      @prefix : <#>.
      @prefix sioc: <http://rdfs.org/sioc/ns#>.
      @prefix dct: <http://purl.org/dc/terms/>.
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
      
      :1  sioc:content "A message" ;
          dct:created "2024-07-01T17:47:14Z"^^xsd:dateTime ;
          foaf:maker  <https://pod.test/alice/profile/card#me> ;
      .
      
      `,
        store,
        "https://pod.test/message",
      );
      const result = new MessageQuery(
        sym("https://pod.test/message#1"),
        store,
      ).queryMessage();
      expect(result).toEqual({
        uri: "https://pod.test/message#1",
        authorWebId: "https://pod.test/alice/profile/card#me",
        date: new Date("2024-07-01T17:47:14Z"),
        text: "A message",
      });
    });

    describe("returns null for invalid messages", () => {
      it("that have no content", () => {
        const store = graph();
        parse(
          `
      @prefix : <#>.
      @prefix sioc: <http://rdfs.org/sioc/ns#>.
      @prefix dct: <http://purl.org/dc/terms/>.
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
      
      :1  
          dct:created "2024-07-01T17:47:14Z"^^xsd:dateTime ;
          foaf:maker  <https://pod.test/alice/profile/card#me> ;
      .
      
      `,
          store,
          "https://pod.test/message",
        );
        const result = new MessageQuery(
          sym("https://pod.test/message#1"),
          store,
        ).queryMessage();
        expect(result).toEqual(null);
      });

      it("that have no date", () => {
        const store = graph();
        parse(
          `
      @prefix : <#>.
      @prefix sioc: <http://rdfs.org/sioc/ns#>.
      @prefix dct: <http://purl.org/dc/terms/>.
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
      
      :1  sioc:content "A message" ;
          foaf:maker  <https://pod.test/alice/profile/card#me> ;
      .
      
      `,
          store,
          "https://pod.test/message",
        );
        const result = new MessageQuery(
          sym("https://pod.test/message#1"),
          store,
        ).queryMessage();
        expect(result).toEqual(null);
      });

      it("that have no author", () => {
        const store = graph();
        parse(
          `
      @prefix : <#>.
      @prefix sioc: <http://rdfs.org/sioc/ns#>.
      @prefix dct: <http://purl.org/dc/terms/>.
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
      
      :1  sioc:content "A message" ;
          dct:created "2024-07-01T17:47:14Z"^^xsd:dateTime ;
      .
      
      `,
          store,
          "https://pod.test/message",
        );
        const result = new MessageQuery(
          sym("https://pod.test/message#1"),
          store,
        ).queryMessage();
        expect(result).toEqual(null);
      });
    });
  });
});
