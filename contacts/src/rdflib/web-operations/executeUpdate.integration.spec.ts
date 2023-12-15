import { executeUpdate } from "./executeUpdate";
import { Fetcher, graph, IndexedFormula, st, sym, UpdateManager } from "rdflib";
import { vcard } from "../namespaces";
import {
  mockNotFound,
  mockTurtleResponse,
} from "../../test-support/mockResponses";
import {
  expectPatchRequest,
  expectPutEmptyTurtleFile,
} from "../../test-support/expectRequests";

describe("executeUpdate", () => {
  let authenticatedFetch: jest.Mock;
  let fetcher: Fetcher;
  let store: IndexedFormula;
  let updater: UpdateManager;
  beforeEach(() => {
    authenticatedFetch = jest.fn();
    store = graph();
    fetcher = new Fetcher(store, {
      fetch: authenticatedFetch,
    });
    updater = new UpdateManager(store);
  });

  it("does a single insertion using PATCH", async () => {
    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      "",
    );
    await executeUpdate(fetcher, updater, {
      uri: "https://pod.test/resource-to-update",
      deletions: [],
      insertions: [
        st(
          sym("https://pod.test/resource-to-update#it"),
          sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          vcard("AddressBook"),
          sym("https://pod.test/resource-to-update"),
        ),
      ],
      filesToCreate: [],
    });
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      `INSERT DATA { <https://pod.test/resource-to-update#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
 }`,
    );
  });

  it("does a single deletion using PATCH", async () => {
    const statementToDelete = st(
      sym("https://pod.test/resource-to-update#it"),
      sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      vcard("AddressBook"),
      sym("https://pod.test/resource-to-update"),
    );
    store.add(statementToDelete);
    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      "",
    );
    await executeUpdate(fetcher, updater, {
      uri: "https://pod.test/resource-to-update",
      deletions: [statementToDelete],
      insertions: [],
      filesToCreate: [],
    });
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      `DELETE DATA { <https://pod.test/resource-to-update#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
 }`,
    );
  });

  it("can insert to multiple destinations", async () => {
    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      "",
    );
    mockTurtleResponse(
      authenticatedFetch,
      "https://pod.test/another-resource",
      "",
    );
    await executeUpdate(fetcher, updater, {
      uri: "https://pod.test/resource-to-update",
      deletions: [],
      insertions: [
        st(
          sym("https://pod.test/resource-to-update#it"),
          sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          vcard("AddressBook"),
          sym("https://pod.test/resource-to-update"),
        ),
        st(
          sym("https://pod.test/another-resource#it"),
          sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          vcard("AddressBook"),
          sym("https://pod.test/another-resource"),
        ),
      ],
      filesToCreate: [],
    });
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      `INSERT DATA { <https://pod.test/resource-to-update#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
 }`,
    );
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/another-resource",
      `INSERT DATA { <https://pod.test/another-resource#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
 }`,
    );
  });

  it("creates a new empty file via PUT", async () => {
    mockNotFound(authenticatedFetch, "https://pod.test/file-to-create");
    await executeUpdate(fetcher, updater, {
      uri: "https://pod.test/resource-to-update",
      deletions: [],
      insertions: [],
      filesToCreate: [{ uri: "https://pod.test/file-to-create" }],
    });
    expectPutEmptyTurtleFile(
      authenticatedFetch,
      "https://pod.test/file-to-create",
    );
  });
});
