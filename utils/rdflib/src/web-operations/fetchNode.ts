import { Fetcher, Node } from "rdflib";

/**
 * Nullsafe fetching of a node
 * @param fetcher - The fetcher to use
 * @param node - A node to fetch, or null to do nothing at all
 */
export async function fetchNode(fetcher: Fetcher, node: Node | null) {
  if (node) {
    await fetcher.load(node.value);
  }
}
