module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/$1",
  },

  // ⭐ Add these two:
  verbose: true,
  testLocationInResults: true,

  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "html", "json"],
  coveragePathIgnorePatterns: ["/node_modules/", "/_tests_/", "/.next/", "/components/ui/"],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  reporters: [
    "default",
    ["jest-html-reporter", { configFile: "jesthtml.config.json" }]
  ],
};
