import { mockLdpContainer } from "./mockResponses";

describe("mockResponses", () => {
  describe("mockLdpContainer", () => {
    it("mocks a container without contents", async () => {
      const fetch = jest.fn();
      mockLdpContainer(fetch, "http://container.test/");
      const result = await fetch("http://container.test/", {});
      expect(await result.text()).toEqual(`
      @prefix dc: <http://purl.org/dc/terms/>.
      @prefix ldp: <http://www.w3.org/ns/ldp#>.
      @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
      
      <> a ldp:Container, ldp:BasicContainer, ldp:Resource ;
        
      .
`);
    });

    it("mocks a container with contents", async () => {
      const fetch = jest.fn();
      mockLdpContainer(fetch, "http://container.test/", [
        "http://container.test/one",
        "http://container.test/two",
      ]);
      const result = await fetch("http://container.test/", {});
      expect(await result.text()).toEqual(`
      @prefix dc: <http://purl.org/dc/terms/>.
      @prefix ldp: <http://www.w3.org/ns/ldp#>.
      @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
      
      <> a ldp:Container, ldp:BasicContainer, ldp:Resource ;
        ldp:contains <http://container.test/one>; ldp:contains <http://container.test/two>
      .
`);
    });
  });
});
