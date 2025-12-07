const mockLogger = {
  warn: jest.fn(),
};

jest.mock("@/utils/logger", () => ({
  __esModule: true,
  default: mockLogger,
}));

const mockSendCommand = jest.fn();

jest.mock("@/db/connectRedis", () => ({
  redisClient: {
    sendCommand: (...args: any[]) => mockSendCommand(...args),
  },
}));

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    isProduction: false,
  },
}));

const rateLimitMock = jest.fn((options) => options);

jest.mock("express-rate-limit", () => rateLimitMock);

const RedisStoreMock = jest.fn();

jest.mock("rate-limit-redis", () => RedisStoreMock);

import { createRateLimiter } from "@/middlewares/rateLimiter";

describe("middlewares/rateLimiter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates rate limiter with Infinity max in non-production", () => {
    const limiterOptions: any = createRateLimiter({
      windowMs: 60000,
      max: 10,
      message: "Too many",
      prefix: "test-prefix",
    });

    expect(RedisStoreMock).toHaveBeenCalled();
    expect(limiterOptions.max).toBe(Infinity);
    expect(typeof limiterOptions.handler).toBe("function");
  });

  it("handler logs warning and sends JSON response", () => {
    const limiterOptions: any = createRateLimiter({
      windowMs: 60000,
      max: 10,
      message: "Too many",
      prefix: "test-prefix",
    });

    const req: any = { ip: "127.0.0.1" };
    const jsonMock = jest.fn();
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jsonMock,
    };

    const next = jest.fn();
    const options = {
      max: 10,
      windowMs: 60000,
      statusCode: 429,
    } as any;

    limiterOptions.handler(req, res, next, options);

    expect(mockLogger.warn).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Too many",
        remaining: 0,
      })
    );
  });
});
