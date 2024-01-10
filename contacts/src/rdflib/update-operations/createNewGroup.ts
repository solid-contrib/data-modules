import { AddressBookQuery } from "../queries";
import { UpdateOperation } from "./index";
import { lit, st } from "rdflib";
import { vcard } from "../namespaces";

export function createNewGroup(
  addressBook: AddressBookQuery,
  groupName: string,
): UpdateOperation {
  const groupIndex = addressBook.queryGroupIndex();
  if (!groupIndex) {
    throw new Error("group index is missing or invalid");
  }
  const groupNode = addressBook.proposeNewGroupNode();
  return {
    uri: groupNode.uri,
    insertions: [
      st(groupNode, vcard("fn"), lit(groupName), groupIndex),
      st(groupNode, vcard("fn"), lit(groupName), groupNode.doc()),
    ],
    deletions: [],
    filesToCreate: [],
  };
}
