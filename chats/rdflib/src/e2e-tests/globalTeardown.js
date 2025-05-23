import { server } from "./globalSetup.js";

export default async function () {
  console.log("stopping test server...");
  await server.stop();
}
