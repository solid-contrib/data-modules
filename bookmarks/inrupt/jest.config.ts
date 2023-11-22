import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  testRegex: "\\.test\\.ts$",
  testEnvironment: "node",
};

export default jestConfig;
