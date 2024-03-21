import { startServer } from "./start-server";
import { v4 as uuid } from "uuid";
import { App } from "@solid/community-server";

export let server: App;

export default async function () {
  const testId = uuid();
  console.log("starting test server. Test ID is", testId);
  server = await startServer(testId);
}
