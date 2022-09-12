/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  preset: "ts-jest",
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  testEnvironment: "node",
  moduleNameMapper: {
    "@/tests/(.*)": "<rootDir>/tests/$1",
    "@/(.*)": "<rootDir>/src/$1",
  },
};
