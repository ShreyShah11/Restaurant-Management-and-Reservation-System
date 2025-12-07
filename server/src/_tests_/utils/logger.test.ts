/**
 * We mock the env config module so that importing the logger
 * does not execute the real env.ts, which would call process.exit
 * if .env files are not configured in the test environment.
 */

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    isProduction: false,
  },
}));

import logger from "@/utils/logger";

describe("utils/logger", () => {
  it("logs messages without throwing", () => {
    expect(() => {
      logger.info("info message");
      logger.error("error message");
    }).not.toThrow();
  });

  it("handles logger error events without crashing", () => {
    const handler = (logger as any).listeners?.("error")?.[0];
    if (handler) {
      expect(() => handler(new Error("logger-error"))).not.toThrow();
    }
  });
});
