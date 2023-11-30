import { lit, st, sym } from "rdflib";
import { v4 as uuid } from "uuid";
import { dc, vcard } from "./namespaces";
import { UpdateOperation } from "./web-operations/executeUpdate";

export { UpdateOperation } from "./web-operations/executeUpdate";

export function createAddressBook(
  container: string,
  name: string,
): UpdateOperation {
  const id = uuid();
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
    filesToCreate: [{ uri: nameEmailIndexUri }, { uri: groupIndexUri }],
  };
}
