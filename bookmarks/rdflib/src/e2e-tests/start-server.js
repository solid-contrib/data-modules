import { AppRunner, joinFilePath } from "@solid/community-server";

import { cp } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function startServer(id) {
  const testDataPath = joinFilePath(__dirname, "test-data");
  const rootFilePath = joinFilePath(__dirname, ".test-data", id);
  const app = await new AppRunner().create({
    config: joinFilePath(__dirname, "./config.json"),
    loaderProperties: {
      mainModulePath: joinFilePath(__dirname, "../"),
      dumpErrorState: false,
    },
    shorthand: {
      port: 3456,
      loggingLevel: "off",
      rootFilePath: rootFilePath,
    },
    variableBindings: {},
  });

  await app.start();

  await cp(testDataPath, rootFilePath, { recursive: true });

  return app;
}
