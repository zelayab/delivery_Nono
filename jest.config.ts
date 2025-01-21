import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
  transform: {
   "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      { configFile: "./.babelrc.test.js" },
    ],
  },
  transformIgnorePatterns: ["/node_modules/(?!(modulo-especial|otro-modulo)/)"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
};

export default config;