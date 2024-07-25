import { Fetcher, IndexedFormula, NamedNode, Node, sym, UpdateManager } from "rdflib";
import {
  fetchNode,
  ModuleConfig,
  PreferencesQuery,
  ProfileQuery,
  TypeIndexQuery,
  TypeRegistrationsByVisibility
} from "../index.js";
import { ldp, rdf } from "../namespaces/index.js";

/**
 * Provides common functionality useful for many rdflib-based data modules
 */
export class ModuleSupport {
  private readonly fetcher: Fetcher;
  private readonly store: IndexedFormula;
  private readonly updater: UpdateManager;

  constructor(config: ModuleConfig) {
    this.store = config.store;
    this.fetcher = config.fetcher;
    this.updater = config.updater;
  }

  /**
   * Nullsafe fetching of a node
   * @param node - A node to fetch, or null to do nothing at all
   */
  async fetchNode(node: Node | null) {
    return fetchNode(this.fetcher, node);
  }

  /**
   * Fetch all the given nodes in parallel
   * @param nodes
   */
  async fetchAll(nodes: (Node | null)[]) {
    return Promise.all(nodes.map((it) => this.fetchNode(it)));
  }

  /**
   * Discover storage locations (instances or instance containers) for a given type by fetching and querying private and public type indexes
   * @param webId - The WebID to search for type indexes
   * @param typeNode - a NamedNode representing the type to discover
   */
  async discoverType(
    webId: NamedNode,
    typeNode: NamedNode,
  ): Promise<TypeRegistrationsByVisibility> {
    // 1. fetch webId
    //   2.1 query profile for public type index
    //     3.1 fetch public type index
    //       4.1 query registrations
    //   2.2 query profile for preferences file
    //     3.2 fetch preferences file
    //       4.2 query settings document for private type index
    //         5. fetch private type index
    //           6. query registrations

    // 1.
    await this.fetchNode(webId);
    // 2.
    const profileQuery = new ProfileQuery(webId, this.store);
    const publicTypeIndex = profileQuery.queryPublicTypeIndex();
    const preferencesFile = profileQuery.queryPreferencesFile();
    // 3.
    await Promise.allSettled([
      this.fetchNode(publicTypeIndex),
      this.fetchNode(preferencesFile),
    ]);
    // 4.1
    const noRegistrations = { instances: [], instanceContainers: [] };
    const publicRegistrations = publicTypeIndex
      ? new TypeIndexQuery(
          this.store,
          publicTypeIndex,
        ).queryRegistrationsForType(typeNode)
      : noRegistrations;
    // 4.2
    const privateTypeIndex = preferencesFile
      ? new PreferencesQuery(
          this.store,
          webId,
          preferencesFile,
        ).queryPrivateTypeIndex()
      : null;
    // 5.
    await this.fetchNode(privateTypeIndex);
    const privateRegistrations = privateTypeIndex
      ? new TypeIndexQuery(
          this.store,
          privateTypeIndex,
        ).queryRegistrationsForType(typeNode)
      : noRegistrations;
    return {
      private: privateRegistrations,
      public: publicRegistrations,
    };
  }

  /**
   * Checks whether the resource identified by the given URL is a LDP container
   * @param storageUrl - The URL to check
   * @returns true if it is a container, false otherwise
   */
  async isContainer(storageUrl: string) {
    const storageNode = sym(storageUrl);
    await this.fetcher.load(storageNode.value);
    return this.store.holds(
      storageNode,
      rdf("type"),
      ldp("Container"),
      storageNode.doc(),
    );
  }
}
