import { graph, parse, sym } from "rdflib";
import { TypeIndexQuery } from "./TypeIndexQuery";

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

    it("returns nothing if type registration does not list instances", () => {
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
      const result = query.queryAddressBookInstances();
      expect(result).toEqual([]);
    });

    it("returns nothing if registration is for wrong class", () => {
      const store = graph();

      parse(
        `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a solid:TypeRegistration ;
         solid:forClass :Anything ;
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
      expect(result).toEqual([]);
    });

    it("does not return instances that are listed by something different from a type registration", () => {
      const store = graph();

      parse(
        `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a :NotATypeRegstration ;
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

    describe("use correct source documents", () => {
      it("returns no instances from a wrong document", () => {
        const store = graph();

        parse(
          `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      <https://pod.test/alice/setting/publicTypeIndex.ttl#registration-1> a solid:TypeRegistration ;
         solid:forClass vcard:AddressBook ;
         solid:instance <https://pod.test/alice/contacts/3/index.ttl#this>, <https://pod.test/alice/contacts/4/index.ttl#this> ;
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

      it("do not accept type registration type from wrong document", () => {
        const store = graph();

        parse(
          `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      <https://pod.test/alice/setting/publicTypeIndex.ttl#registration-1> a solid:TypeRegistration .
      
      `,
          store,
          "https://pod.test/alice/setting/wrong.ttl",
        );

        parse(
          `
      @prefix : <#>.
      @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
      @prefix solid: <http://www.w3.org/ns/solid/terms#>.
      
      :registration-1 a :NotATypeRegistration ;
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
        expect(result).toEqual([]);
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
        const result = query.queryAddressBookInstances();
        expect(result).toEqual([]);
      });
    });
  });
});
