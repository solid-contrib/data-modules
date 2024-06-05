import { startServer } from "./start-server";
import { generateId } from "../generate-id";
import { App } from "@solid/community-server";

export let server: App;

export default async function () {
  const testId = generateId();
  console.log("starting test server. Test ID is", testId);
  server = await startServer(testId);
}
