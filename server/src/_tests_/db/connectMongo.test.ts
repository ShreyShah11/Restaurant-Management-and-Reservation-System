const mockConnect = jest.fn();

jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    connect: mockConnect,
  },
  connect: mockConnect,
}));

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    MONGODB_URI: "mongodb://localhost:27017/testdb",
  },
}));

jest.mock("@/utils/logger", () => ({
  __esModule: true,
  default: mockLogger,
}));

import connectMongo from "@/db/connectMongo";

describe("db/connectMongo", () => {
  beforeEach(() => {
    mockConnect.mockReset();
    mockLogger.info.mockReset();
    mockLogger.error.mockReset();
  });

  it("logs error and rethrows when connection fails", async () => {
    const error = new Error("connect-fail");
    mockConnect.mockRejectedValueOnce(error);

    await expect(connectMongo()).rejects.toBe(error);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it("connects to MongoDB and logs success on first call", async () => {
    mockConnect.mockResolvedValueOnce({ connection: { name: "testdb" } } as any);

    const conn = await connectMongo();

    expect(mockConnect).toHaveBeenCalledWith(
      "mongodb://localhost:27017/testdb"
    );
    expect(conn).toEqual({ connection: { name: "testdb" } });
    expect(mockLogger.info).toHaveBeenCalledWith("MongoDB connected: testdb");
  });

  it("reuses existing connection on subsequent calls", async () => {
    const first = await connectMongo();
    const second = await connectMongo();

    expect(first).toBe(second);
    expect(mockConnect).not.toHaveBeenCalled();
  });
});
