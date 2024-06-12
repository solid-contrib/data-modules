import { Fetcher, UpdateManager } from "rdflib";

import { Statement } from "rdflib";

/**
 * An empty turtle file that should be created at the given URL
 */
export interface FileToCreate {
  /**
   * The URL of the file
   */
  url: string;
}

/**
 * Describes updates that should be applied to a Pod (without applying them yet)
 *
 * Use {@link executeUpdate} to actually perform the operation.
 */
export interface UpdateOperation {
  /**
   * RDF statements that should be inserted
   */
  insertions: Statement[];
  /**
   * RDF statements that should be deleted
   */
  deletions: Statement[];
  /**
   * Empty files that should be created
   */
  filesToCreate: FileToCreate[];
}

/**
 * Applies the described updates to a Pod
 * @param fetcher - The fetcher to use for the update
 * @param updater - The updater to use for the update
 * @param operation - The operations to perform
 */
export async function executeUpdate(
  fetcher: Fetcher,
  updater: UpdateManager,
  operation: UpdateOperation,
) {
  await updater.updateMany(operation.deletions, operation.insertions);
  operation.filesToCreate.map((file) => {
    createEmptyTurtleFile(fetcher, file.url);
  });
}

function createEmptyTurtleFile(fetcher: Fetcher, url: string) {
  return fetcher.webOperation("PUT", url, {
    contentType: "text/turtle",
  });
}
