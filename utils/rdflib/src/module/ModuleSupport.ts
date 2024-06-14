import { Fetcher, IndexedFormula, Node, sym, UpdateManager } from "rdflib";
import { fetchNode, ModuleConfig } from "../index.js";
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
