import { startServer } from "./start-server.js";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";

export let server;

export default async function () {
  const testId = generateId();
  console.log("starting test server. Test ID is", testId);
  server = await startServer(testId);
}
