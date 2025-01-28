import type { Config } from "jest";
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const customConfig: Config = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": ["babel-jest", { presets: ["next/babel"] }]
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@mantine|@tabler|firebase)/)"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/coverage/"
  ],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}"
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/types.ts",
    "!src/middleware/*",
    "!src/app/layout.tsx",
    "!src/app/providers.tsx",
    "!src/firebase/firebaseConfig.ts",
    "!src/app/not-found.tsx",
    "!src/app/unauthorized.tsx"
  ],
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 20,
      functions: 20,
      lines: 40
    }
  },
  verbose: true
};

// Crea la configuración de Jest con Next.js
export default createJestConfig(customConfig);