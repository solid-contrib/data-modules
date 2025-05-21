const path = require("path");
const monorepoRoot = path.resolve(__dirname);

module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@ldo/([^/]+)$": `${monorepoRoot}/packages/$1/src/index.ts`,
    "^@ldo/([^/]+)/(.*)$": `${monorepoRoot}/packages/$1/$2`,
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/coverage/",
    "/test/",
  ],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.cjs.json",
      },
    ],
  },
  rootDir: "./", // Sets context for this package
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    // "!src/index.ts", // Optional, if index.ts only re-exports
  ],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transformIgnorePatterns: ["/node_modules/", "/dist/"],
  modulePathIgnorePatterns: ["/dist/"],
};
