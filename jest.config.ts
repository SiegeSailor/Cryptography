import type { JestConfigWithTsJest } from "ts-jest";

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["build"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/source/$1" },
} satisfies JestConfigWithTsJest;
