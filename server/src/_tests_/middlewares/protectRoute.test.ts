const mockLogger = {
  error: jest.fn(),
};

jest.mock("@/utils/logger", () => ({
  __esModule: true,
  default: mockLogger,
}));

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    JWT_KEY: "secret",
  },
}));

const verifyMock = jest.fn();

jest.mock("jsonwebtoken", () => ({
  verify: (...args: any[]) => verifyMock(...args),
}));

const existsMock = jest.fn();

jest.mock("@/db/connectRedis", () => ({
  redisClient: {
    exists: (...args: any[]) => existsMock(...args),
  },
}));

import { protectRoute } from "@/middlewares/protectRoute";

describe("middlewares/protectRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRes = () => {
    const res: any = {
      locals: {},
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res;
  };

  it("returns 401 when token is missing", async () => {
    const req: any = { cookies: {} };
    const res = createRes();
    const next = jest.fn();

    await protectRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when jwt.verify throws", async () => {
    const req: any = { cookies: { token: "token" } };
    const res = createRes();
    const next = jest.fn();

    verifyMock.mockImplementationOnce(() => {
      throw new Error("invalid");
    });

    await protectRoute(req, res, next);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
    });
  });

  it("returns 401 when userID is missing in token", async () => {
    const req: any = { cookies: { token: "token" } };
    const res = createRes();
    const next = jest.fn();

    verifyMock.mockReturnValueOnce({ role: "customer" } as any);

    await protectRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
    });
  });

  it("returns 401 when token is blocked in redis", async () => {
    const req: any = { cookies: { token: "token" } };
    const res = createRes();
    const next = jest.fn();

    verifyMock.mockReturnValueOnce({ userID: "u1", role: "customer" } as any);
    existsMock.mockResolvedValueOnce(1);

    await protectRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token expired",
    });
  });

  it("returns 403 when role does not match res.locals.role", async () => {
    const req: any = { cookies: { token: "token" } };
    const res = createRes();
    res.locals.role = "owner";
    const next = jest.fn();

    verifyMock.mockReturnValueOnce({ userID: "u1", role: "customer" } as any);
    existsMock.mockResolvedValueOnce(0);

    await protectRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden",
    });
  });

  it("calls next on valid token and no role restriction", async () => {
    const req: any = { cookies: { token: "token" } };
    const res = createRes();
    const next = jest.fn();

    verifyMock.mockReturnValueOnce({ userID: "u1", role: "customer" } as any);
    existsMock.mockResolvedValueOnce(0);

    await protectRoute(req, res, next);

    expect(res.locals.userID).toBe("u1");
    expect(next).toHaveBeenCalled();
  });
});
