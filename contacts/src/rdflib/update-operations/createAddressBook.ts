import { lit, st, sym } from "rdflib";

import { dc, vcard } from "../namespaces.js";

import { UpdateOperation } from "@solid-data-modules/rdflib-utils";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";

export function createAddressBook(
  container: string,
  name: string,
): UpdateOperation & { uri: string } {
  const id = generateId();
  const uri = `${container}${id}/index.ttl#this`;
  const nameEmailIndexUri = `${container}${id}/people.ttl`;
  const groupIndexUri = `${container}${id}/groups.ttl`;

  const insertions = [
    st(
      sym(uri),
      sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      vcard("AddressBook"),
      sym(uri).doc(),
    ),
    st(sym(uri), dc("title"), lit(name), sym(uri).doc()),
    st(
      sym(uri),
      vcard("nameEmailIndex"),
      sym(nameEmailIndexUri),
      sym(uri).doc(),
    ),
    st(sym(uri), vcard("groupIndex"), sym(groupIndexUri), sym(uri).doc()),
  ];

  return {
    uri,
    deletions: [],
    insertions,
    filesToCreate: [{ url: nameEmailIndexUri }, { url: groupIndexUri }],
  };
}
