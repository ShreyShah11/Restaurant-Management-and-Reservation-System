const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    LOCAL_REDIS: 1,
    REDIS_USERNAME: "user",
    REDIS_PASSWORD: "pass",
    REDIS_HOST: "localhost",
    REDIS_PORT: 6379,
  },
}));

jest.mock("@/utils/logger", () => ({
  __esModule: true,
  default: mockLogger,
}));

const connectMock = jest.fn();
const onMock = jest.fn();

jest.mock("redis", () => ({
  createClient: jest.fn(() => ({
    connect: connectMock,
    on: onMock,
    sendCommand: jest.fn(),
  })),
}));

import { connectRedis, redisClient } from "@/db/connectRedis";

describe("db/connectRedis", () => {
  beforeEach(() => {
    connectMock.mockReset();
    onMock.mockReset();
    mockLogger.error.mockReset();
  });

  it("connects Redis client successfully", async () => {
    connectMock.mockResolvedValueOnce(undefined);

    await connectRedis();

    expect(connectMock).toHaveBeenCalled();
  });

  it("logs error and calls process.exit on connection failure", async () => {
    connectMock.mockRejectedValueOnce(new Error("fail"));

    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as any);

    await connectRedis();

    expect(mockLogger.error).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });

  it("exports redisClient with sendCommand method", () => {
    expect(typeof (redisClient as any).sendCommand).toBe("function");
  });

  it("registers error and connect event listeners on client", () => {
    // Re-import module so top-level listener registration runs after mocks
    jest.resetModules();
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("@/db/connectRedis");
    });

    expect(onMock).toHaveBeenCalledWith("error", expect.any(Function));
    expect(onMock).toHaveBeenCalledWith("connect", expect.any(Function));

    const errorHandler = onMock.mock.calls.find(([event]) => event === "error")?.[1];
    const connectHandler = onMock.mock.calls.find(([event]) => event === "connect")?.[1];

    errorHandler?.(new Error("boom"));
    connectHandler?.();

    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it("creates remote Redis client when LOCAL_REDIS is falsy", () => {
    jest.resetModules();

    jest.doMock("@/config/env", () => ({
      __esModule: true,
      default: {
        LOCAL_REDIS: 0,
        REDIS_USERNAME: "user",
        REDIS_PASSWORD: "pass",
        REDIS_HOST: "localhost",
        REDIS_PORT: 6379,
      },
    }));

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("@/db/connectRedis");
    });
  });
});
