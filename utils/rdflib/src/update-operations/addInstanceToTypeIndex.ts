import { NamedNode, st, sym } from "rdflib";
import { UpdateOperation } from "../web-operations/index.js";
import { generateId } from "../identifier/index.js";
import { rdf, solid } from "../namespaces/index.js";

/**
 * Create a new type registration for the given type that links to the given resource instance
 * @param typeIndexDoc - The type index document (private or public)
 * @param instanceUri - The URI of the instance to add
 * @param type - The RDF class to register the instance for
 */
export function addInstanceToTypeIndex(
  typeIndexDoc: NamedNode,
  instanceUri: string,
  type: NamedNode,
): UpdateOperation {
  const registrationNode = sym(`${typeIndexDoc.value}#${generateId()}`);
  return {
    deletions: [],
    filesToCreate: [],
    insertions: [
      st(
        registrationNode,
        rdf("type"),
        solid("TypeRegistration"),
        typeIndexDoc,
      ),
      st(registrationNode, solid("forClass"), type, typeIndexDoc),
      st(registrationNode, solid("instance"), sym(instanceUri), typeIndexDoc),
    ],
  };
}
