import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  moduleFileExtensions: ["js", "json", "ts"],
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [".*\\.spec\\.ts$"],
  coverageDirectory: "coverage",
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "src"],
  setupFiles: ["<rootDir>/src/setupTests.ts"],
};

export default config;
