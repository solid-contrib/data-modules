import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  testRegex: "\\.test\\.ts$",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": "ts-jest"
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!@rezasoltani/solid-typeindex-support)"
  ],
};

export default jestConfig;
