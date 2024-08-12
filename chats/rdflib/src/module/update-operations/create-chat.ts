import { rdf, UpdateOperation } from "@solid-data-modules/rdflib-utils";
import { lit, st, sym } from "rdflib";
import { dc, meeting } from "../namespaces.js";

export function createChat(chatUri: string, name: string): UpdateOperation {
  const chatNode = sym(chatUri);
  const chatDoc = chatNode.doc();
  return {
    insertions: [
      st(chatNode, rdf("type"), meeting("LongChat"), chatDoc),
      st(chatNode, dc("title"), lit(name), chatDoc),
    ],
    deletions: [],
    filesToCreate: [],
  };
}
