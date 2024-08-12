import { setupModule } from "../../test-support/setupModule";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import { when } from "jest-when";
import { expectPatchRequest } from "@solid-data-modules/rdflib-utils/test-support";

jest.mock("@solid-data-modules/rdflib-utils/identifier");

describe("create chat", () => {
  it("creates index file in a new container and returns the minted URI", () => {
    // given a random ID is generated
    when(generateId).mockReturnValue("abc123");

    // and a chats module
    const authenticatedFetch = jest.fn();
    const chats = setupModule(authenticatedFetch);

    // when a chat is created at a given container
    const uri = chats.createChat({
      containerUri: "https://pod.test/alice/chats/",
      name: "A new chat",
    });

    // then the minted URI is returned
    expect(uri).toMatch(
      new RegExp("https://pod.test/alice/chats/abc123/index.ttl#this"),
    );

    // and an index file has been created
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/alice/chats/abc123/index.ttl",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/alice/chats/abc123/index.ttl#this> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/pim/meeting#LongChat> .
        <https://pod.test/alice/chats/abc123/index.ttl#this> <http://purl.org/dc/elements/1.1/title> "A new chat" .
      };   a solid:InsertDeletePatch .`,
    );
  });
});
