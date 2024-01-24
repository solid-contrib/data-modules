/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  testPathIgnorePatterns: [".*\\.e2e\\.spec\\.ts"],
  detectOpenHandles: true,
  forceExit: true,
};
