import { Fetcher, Node } from "rdflib";

export async function fetchNode(fetcher: Fetcher, node: Node | null) {
  if (node) {
    await fetcher.load(node.value);
  }
}
