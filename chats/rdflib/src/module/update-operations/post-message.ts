import { NamedNode, st, sym } from "rdflib";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";
import { wf } from '../namespaces.js';

export function postMessage(
  messageUri: string,
  chatNode: NamedNode,
): UpdateOperation {
  const messageNode = sym(messageUri);
  return {
    insertions: [st(chatNode, wf("message"), messageNode, messageNode.doc())],
    deletions: [],
    filesToCreate: [],
  };
}
