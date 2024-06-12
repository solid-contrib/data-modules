import { AppRunner, joinFilePath } from "@solid/community-server";

import { cp } from "fs/promises";

export async function startServer(id: string) {
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
