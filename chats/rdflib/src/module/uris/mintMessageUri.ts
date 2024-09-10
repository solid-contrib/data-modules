import { NamedNode } from "rdflib";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";

export function mintMessageUri(chatNode: NamedNode) {
  const date = new Date();
  const dateFolders = date.toISOString().split("T")[0].replace(/-/g, "/");
  const container = chatNode.doc().dir();
  if (!container) {
    throw new Error(`Chat ${chatNode.uri} has no container`);
  }
  return container.uri + dateFolders + "/chat.ttl#" + generateId();
}
