import { graph, parse, sym } from "rdflib";
import { TypeIndexQuery } from "./TypeIndexQuery";

const VCARD_ADDRESS_BOOK = sym("http://www.w3.org/2006/vcard/ns#AddressBook");

describe("TypeIndexQuery", () => {
  describe("query instances", () => {
    it("returns all instances listed in the type registrations for given class", () => {
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
         
      :registration-2 a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instance <https://pod.test/alice/contacts/3/index.ttl#this> ;
         .
      
      `,
        store,
        "https://pod.test/alice/setting/publicTypeIndex.ttl",
      );

      const query = new TypeIndexQuery(
        store,
        sym("https://pod.test/alice/setting/publicTypeIndex.ttl"),
      );
      const result = query.queryInstancesForClass(VCARD_ADDRESS_BOOK);
      expect(result).toEqual([
        sym("https://pod.test/alice/contacts/1/index.ttl#this"),
        sym("https://pod.test/alice/contacts/2/index.ttl#this"),
        sym("https://pod.test/alice/contacts/3/index.ttl#this"),
      ]);
    });
  });

  describe("query registrations for type", () => {
    describe("returns nothing", () => {
      it("if store is empty", () => {
        const store = graph();

        const query = new TypeIndexQuery(
          store,
          sym("https://pod.test/alice/setting/publicTypeIndex.ttl"),
        );
        const result = query.queryRegistrationsForType(VCARD_ADDRESS_BOOK);
        expect(result).toEqual({ instances: [], instanceContainers: [] });
      });

      it("if type registration does not list anything", () => {
        const store = graph();

        parse(
          `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook .
      
      `,
          store,
          "https://pod.test/alice/setting/publicTypeIndex.ttl",
        );

        const query = new TypeIndexQuery(
          store,
          sym("https://pod.test/alice/setting/publicTypeIndex.ttl"),
        );
        const result = query.queryRegistrationsForType(VCARD_ADDRESS_BOOK);
        expect(result).toEqual({
          instances: [],
          instanceContainers: [],
        });
      });

      it("if registration is for wrong class", () => {
        const store = graph();

        parse(
          `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a solid:TypeRegistration ;
         solid:forClass :Anything ;
         solid:instance <https://pod.test/alice/contacts/1/index.ttl#this>, <https://pod.test/alice/contacts/2/index.ttl#this> ;
         solid:instanceContainer <https://pod.test/alice/contacts/> ;
         .
      
      `,
          store,
          "https://pod.test/alice/setting/publicTypeIndex.ttl",
        );

        const query = new TypeIndexQuery(
          store,
          sym("https://pod.test/alice/setting/publicTypeIndex.ttl"),
        );
        const result = query.queryRegistrationsForType(VCARD_ADDRESS_BOOK);
        expect(result).toEqual({
          instances: [],
          instanceContainers: [],
        });
      });
    });

    it("even returns instances from a registration, that is not explicitly typed", () => {
      // see https://github.com/solid/type-indexes/issues/32#issuecomment-2013540668
      const store = graph();

      parse(
        `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1
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
      const result = query.queryRegistrationsForType(VCARD_ADDRESS_BOOK);
      expect(result).toEqual({
        instances: [
          sym("https://pod.test/alice/contacts/1/index.ttl#this"),
          sym("https://pod.test/alice/contacts/2/index.ttl#this"),
        ],
        instanceContainers: [],
      });
    });

    it("returns all instances listed in the type registration for given class", () => {
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
      const result = query.queryRegistrationsForType(VCARD_ADDRESS_BOOK);
      expect(result).toEqual({
        instances: [
          sym("https://pod.test/alice/contacts/1/index.ttl#this"),
          sym("https://pod.test/alice/contacts/2/index.ttl#this"),
        ],
        instanceContainers: [],
      });
    });

    it("does not return instances or containers that are not a named node", () => {
      const store = graph();

      parse(
        `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instanceContainer "literal" ;
         solid:instance "literal" ;
         .
      
      `,
        store,
        "https://pod.test/alice/setting/publicTypeIndex.ttl",
      );

      const query = new TypeIndexQuery(
        store,
        sym("https://pod.test/alice/setting/publicTypeIndex.ttl"),
      );
      const result = query.queryRegistrationsForType(VCARD_ADDRESS_BOOK);
      expect(result).toEqual({
        instances: [],
        instanceContainers: [],
      });
    });

    it("returns all instance containers listed in the type registration for given class", () => {
      const store = graph();

      parse(
        `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instanceContainer <https://pod.test/alice/contacts/>, <https://pod.test/alice/address-books/> ;
         .
      
      `,
        store,
        "https://pod.test/alice/setting/publicTypeIndex.ttl",
      );

      const query = new TypeIndexQuery(
        store,
        sym("https://pod.test/alice/setting/publicTypeIndex.ttl"),
      );
      const result = query.queryRegistrationsForType(VCARD_ADDRESS_BOOK);
      expect(result).toEqual({
        instances: [],
        instanceContainers: [
          sym("https://pod.test/alice/contacts/"),
          sym("https://pod.test/alice/address-books/"),
        ],
      });
    });

    it("combines instances and containers from multiple type registrations for given class", () => {
      // see https://github.com/solid/type-indexes/issues/32#issuecomment-2013540668
      const store = graph();

      parse(
        `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instance <https://pod.test/alice/contacts/1/index.ttl#this> .
               
      :registration-2 a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instance <https://pod.test/alice/contacts/2/index.ttl#this> .
         
      :registration-3 a solid:TypeRegistration ;
         solid:forClass :SomeThingElse ;
         solid:instance <https://pod.test/alice/something/else/index.ttl#this> .
         
      :registration-4 a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instanceContainer <https://pod.test/alice/contacts-container-1/> .
         
      :registration-5 a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instanceContainer <https://pod.test/alice/contacts-container-2/> .
         
      :registration-6 a solid:TypeRegistration ;
         solid:forClass :SomeThingElse ;
         solid:instanceContainer <https://pod.test/alice/other-container/> .
      
      `,
        store,
        "https://pod.test/alice/setting/publicTypeIndex.ttl",
      );

      const query = new TypeIndexQuery(
        store,
        sym("https://pod.test/alice/setting/publicTypeIndex.ttl"),
      );
      const result = query.queryRegistrationsForType(VCARD_ADDRESS_BOOK);
      expect(result).toEqual({
        instances: [
          sym("https://pod.test/alice/contacts/1/index.ttl#this"),
          sym("https://pod.test/alice/contacts/2/index.ttl#this"),
        ],
        instanceContainers: [
          sym("https://pod.test/alice/contacts-container-1/"),
          sym("https://pod.test/alice/contacts-container-2/"),
        ],
      });
    });

    describe("use correct source documents", () => {
      it("returns no instances or containers from a wrong document", () => {
        const store = graph();

        parse(
          `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      <https://pod.test/alice/setting/publicTypeIndex.ttl#registration-1> a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instance <https://pod.test/alice/contacts/3/index.ttl#this>, <https://pod.test/alice/contacts/4/index.ttl#this> ;
         solid:instanceContainer <https://pod.test/alice/wrong-contacts/> ;
         .
      
      `,
          store,
          "https://pod.test/alice/setting/wrong.ttl",
        );

        parse(
          `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instance <https://pod.test/alice/contacts/1/index.ttl#this>, <https://pod.test/alice/contacts/2/index.ttl#this> ;
         solid:instanceContainer <https://pod.test/alice/contacts-container/> ;
         .
      
      `,
          store,
          "https://pod.test/alice/setting/publicTypeIndex.ttl",
        );

        const query = new TypeIndexQuery(
          store,
          sym("https://pod.test/alice/setting/publicTypeIndex.ttl"),
        );
        const result = query.queryRegistrationsForType(VCARD_ADDRESS_BOOK);
        expect(result).toEqual({
          instances: [
            sym("https://pod.test/alice/contacts/1/index.ttl#this"),
            sym("https://pod.test/alice/contacts/2/index.ttl#this"),
          ],
          instanceContainers: [
            sym("https://pod.test/alice/contacts-container/"),
          ],
        });
      });

      it("do not accept solid:forClass statement from wrong document", () => {
        const store = graph();

        parse(
          `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      <https://pod.test/alice/setting/publicTypeIndex.ttl#registration-1> solid:forClass vcard:AddressBook ; .
      
      `,
          store,
          "https://pod.test/alice/setting/wrong.ttl",
        );

        parse(
          `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a solid:TypeRegistration ;
         solid:forClass :OtherClass ;
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
        const result = query.queryRegistrationsForType(VCARD_ADDRESS_BOOK);
        expect(result).toEqual({ instances: [], instanceContainers: [] });
      });
    });
  });
});
