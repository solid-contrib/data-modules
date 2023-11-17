import { Fetcher, UpdateManager } from "rdflib";
import { UpdateOperation } from "./createAddressBook";

export async function executeUpdate(
  fetcher: Fetcher,
  updater: UpdateManager,
  operation: UpdateOperation,
) {
  await updater.update(operation.deletions, operation.insertions);
  operation.filesToCreate.map((file) => {
    createEmptyTurtleFile(fetcher, file.uri);
  });
}

function createEmptyTurtleFile(fetcher: Fetcher, uri: string) {
  return fetcher.webOperation("PUT", uri, {
    contentType: "text/turtle",
  });
}
