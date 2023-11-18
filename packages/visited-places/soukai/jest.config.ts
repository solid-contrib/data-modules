import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest/presets/js-with-ts",
  testRegex: "\\.test\\.ts$",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/testing/setup.ts"],
};

export default jestConfig;
