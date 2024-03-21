import { graph, sym, parse } from "rdflib";
import { TypeIndexQuery } from "./TypeIndexQuery";
import { rdf, solid, vcard } from "../namespaces";

describe("TypeIndexQuery", () => {
  describe("query address book instances", () => {
    it("returns nothing if store is empty", () => {
      const store = graph();

      const query = new TypeIndexQuery(
        store,
        sym("https://pod.test/alice/setting/publicTypeIndex.ttl"),
      );
      const result = query.queryAddressBookInstances();
      expect(result).toEqual([]);
    });

    it("returns all instances listed in the type registration for AddressBook", () => {
      const store = graph();

      parse(
        `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instance <https://pod.test/alice/contacts/1/index.ttl#this>, <https://pod.test/alice/contacts/2/index.ttl#this> ;
         .
      
      `,
        store,
        "https://pod.test/alice/setting/publicTypeIndex.ttl",
      );

      const query = new TypeIndexQuery(
        store,
        sym("https://pod.test/alice/setting/publicTypeIndex.ttl"),
      );
      const result = query.queryAddressBookInstances();
      expect(result).toEqual([
        "https://pod.test/alice/contacts/1/index.ttl#this",
        "https://pod.test/alice/contacts/2/index.ttl#this",
      ]);
    });
  });
});
