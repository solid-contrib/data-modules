import { lit, NamedNode, st, sym } from "rdflib";
import { UpdateOperation } from "@solid-data-modules/rdflib-utils";
import { dct, foaf, sioc, wf, xsd } from "../namespaces.js";

export function postMessage(
  messageUri: string,
  text: string,
  authorWebId: string,
  chatNode: NamedNode,
): UpdateOperation {
  const messageNode = sym(messageUri);
  return {
    insertions: [
      st(chatNode, wf("message"), messageNode, messageNode.doc()),
      st(messageNode, sioc("content"), lit(text), messageNode.doc()),
      st(
        messageNode,
        dct("created"),
        lit(new Date().toISOString(), undefined, xsd("dateTime")),
        messageNode.doc(),
      ),
      st(messageNode, foaf("maker"), sym(authorWebId), messageNode.doc()),
    ],
    deletions: [],
    filesToCreate: [],
  };
}
