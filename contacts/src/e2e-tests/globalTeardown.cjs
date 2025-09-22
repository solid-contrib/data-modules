import { server } from "./globalSetup.cjs";

export default async function () {
  console.log("stopping test server...");
  await server.stop();
}
