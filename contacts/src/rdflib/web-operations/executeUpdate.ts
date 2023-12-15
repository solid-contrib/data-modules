import { Fetcher, Statement, UpdateManager } from "rdflib";

export interface UpdateOperation {
  uri: string;
  insertions: Statement[];
  deletions: Statement[];
  filesToCreate: FileToCreate[];
}

export interface FileToCreate {
  uri: string;
}

export async function executeUpdate(
  fetcher: Fetcher,
  updater: UpdateManager,
  operation: UpdateOperation,
) {
  await updater.updateMany(operation.deletions, operation.insertions);
  operation.filesToCreate.map((file) => {
    createEmptyTurtleFile(fetcher, file.uri);
  });
}

function createEmptyTurtleFile(fetcher: Fetcher, uri: string) {
  return fetcher.webOperation("PUT", uri, {
    contentType: "text/turtle",
  });
}
