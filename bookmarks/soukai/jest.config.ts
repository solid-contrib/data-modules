import type { JestConfigWithTsJest } from "ts-jest";

const esModules = ['soukai-solid-utils', '@rezasoltani/solid-typeindex-support', '@noeldemartin/solid-utils'].join('|');


const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  testRegex: "\\.test\\.ts$",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
    [`(${esModules}).+\\.js$`]: 'ts-jest',
  },
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules})`
  ],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
};

export default jestConfig;
