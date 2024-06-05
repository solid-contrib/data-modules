import { server } from "./globalSetup";

export default async function () {
  console.log("stopping test server...");
  await server.stop();
}
