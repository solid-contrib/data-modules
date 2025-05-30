import { ResourceInfo } from "@ldo/test-solid-server";

export const testFiles: ResourceInfo = {
  slug: "placeholder/",
  isContainer: true,
  contains: [] 
}

//     {
//       slug: "chat1/",
//       isContainer: true,
//       contains: [
//         {
//           slug: "index.ttl",
//           isContainer: false,
//           mimeType: "text/ttl",
//           data: `@prefix : <#>.
// @prefix dc: <http://purl.org/dc/elements/1.1/>.
// @prefix meeting: <http://www.w3.org/ns/pim/meeting#>.
// @prefix ui: <http://www.w3.org/ns/ui#>.
// @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
// @prefix c: </profile/card#>.
// @prefix terms: <https://liqid.chat/terms/>.

// :this
//     a meeting:LongChat;
//     dc:author c:me;
//     dc:created "2023-11-25T20:58:21.266Z"^^xsd:dateTime;
//     dc:title "Scatterverse ";
//     ui:sharedPreferences :SharedPreferences;
//     terms:isDiscoverable true.`
//         },

//       ]
//     }