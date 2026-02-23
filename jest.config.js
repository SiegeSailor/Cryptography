/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["build"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/source/$1",
  },
  maxWorkers: 1,
};
