import { AddressBookQuery } from "../queries";
import { UpdateOperation } from "./index";

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
    insertions: [],
    deletions: [],
    filesToCreate: [],
  };
}
