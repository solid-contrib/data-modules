import { AddressBookQuery } from "../queries/index.js";
import { lit, st } from "rdflib";
import { vcard } from "../namespaces.js";
import { rdf, UpdateOperation } from "@solid-data-modules/rdflib-utils";

export function createNewGroup(
  addressBook: AddressBookQuery,
  groupName: string,
): UpdateOperation & { uri: string } {
  const groupIndex = addressBook.queryGroupIndex();
  if (!groupIndex) {
    throw new Error("group index is missing or invalid");
  }
  const groupNode = addressBook.proposeNewGroupNode();
  const groupDoc = groupNode.doc();
  return {
    uri: groupNode.uri,
    insertions: [
      st(groupNode, vcard("fn"), lit(groupName), groupIndex),
      st(groupNode, vcard("fn"), lit(groupName), groupDoc),
      st(groupNode, rdf("type"), vcard("Group"), groupDoc),
      st(
        addressBook.addressBookNode,
        vcard("includesGroup"),
        groupNode,
        groupIndex,
      ),
    ],
    deletions: [],
    filesToCreate: [],
  };
}
