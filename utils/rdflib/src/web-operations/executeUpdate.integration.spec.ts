import { executeUpdate } from "./executeUpdate";
import { Fetcher, graph, IndexedFormula, st, sym, UpdateManager } from "rdflib";
import {
  mockNotFound,
  mockTurtleDocument,
  expectPatchRequest,
  expectPutEmptyTurtleFile,
} from "../test-support";

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
    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      "",
    );
    await executeUpdate(fetcher, updater, {
      deletions: [],
      insertions: [
        st(
          sym("https://pod.test/resource-to-update#it"),
          sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          sym("http://www.w3.org/2006/vcard/ns#AddressBook"),
          sym("https://pod.test/resource-to-update"),
        ),
      ],
      filesToCreate: [],
    });
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/resource-to-update#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
      };   a solid:InsertDeletePatch .`,
    );
  });

  it("does a single deletion using PATCH", async () => {
    const statementToDelete = st(
      sym("https://pod.test/resource-to-update#it"),
      sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      sym("http://www.w3.org/2006/vcard/ns#AddressBook"),
      sym("https://pod.test/resource-to-update"),
    );
    store.add(statementToDelete);
    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      "",
    );
    await executeUpdate(fetcher, updater, {
      deletions: [statementToDelete],
      insertions: [],
      filesToCreate: [],
    });
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:deletes {
        <https://pod.test/resource-to-update#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
      };   a solid:InsertDeletePatch .`,
    );
  });

  it("can insert to multiple destinations", async () => {
    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      "",
    );
    mockTurtleDocument(
      authenticatedFetch,
      "https://pod.test/another-resource",
      "",
    );
    await executeUpdate(fetcher, updater, {
      deletions: [],
      insertions: [
        st(
          sym("https://pod.test/resource-to-update#it"),
          sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          sym("http://www.w3.org/2006/vcard/ns#AddressBook"),
          sym("https://pod.test/resource-to-update"),
        ),
        st(
          sym("https://pod.test/another-resource#it"),
          sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
          sym("http://www.w3.org/2006/vcard/ns#AddressBook"),
          sym("https://pod.test/another-resource"),
        ),
      ],
      filesToCreate: [],
    });
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/resource-to-update",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/resource-to-update#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
      };   a solid:InsertDeletePatch .`,
    );
    expectPatchRequest(
      authenticatedFetch,
      "https://pod.test/another-resource",
      `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:patch

      solid:inserts {
        <https://pod.test/another-resource#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2006/vcard/ns#AddressBook> .
      };   a solid:InsertDeletePatch .`,
    );
  });

  it("creates a new empty file via PUT", async () => {
    mockNotFound(authenticatedFetch, "https://pod.test/file-to-create");
    await executeUpdate(fetcher, updater, {
      deletions: [],
      insertions: [],
      filesToCreate: [{ url: "https://pod.test/file-to-create" }],
    });
    expectPutEmptyTurtleFile(
      authenticatedFetch,
      "https://pod.test/file-to-create",
    );
  });
});
