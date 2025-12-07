import { Request, Response } from "express";

// Mock env config to avoid real secrets
jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    JWT_KEY: "test-jwt-key",
    SENDER_EMAIL: "sender@example.com",
    isProduction: false,
  },
}));

// Redis client mock
const redisSetMock = jest.fn();
const redisGetMock = jest.fn();
const redisDelMock = jest.fn();
const redisExpireAtMock = jest.fn();

jest.mock("@/db/connectRedis", () => ({
  __esModule: true,
  redisClient: {
    set: redisSetMock,
    get: redisGetMock,
    del: redisDelMock,
    expireAt: redisExpireAtMock,
  },
}));

// Nodemailer mock
const sendMailMock = jest.fn();

jest.mock("@/config/nodemailer", () => ({
  __esModule: true,
  transporter: {
    sendMail: sendMailMock,
  },
}));

// Logger mock
const loggerMock = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

jest.mock("@/utils/logger", () => ({
  __esModule: true,
  default: loggerMock,
}));

// OTP + password helpers
jest.mock("@/utils/generateOTP", () => ({
  __esModule: true,
  default: jest.fn(() => "123456"),
}));

jest.mock("@/utils/emailTemplates", () => ({
  __esModule: true,
  verifyEmailTemplate: jest.fn((otp: string) => `<verify ${otp} />`),
  resetPasswordVerifyTemplate: jest.fn((otp: string) => `<reset ${otp} />`),
}));

jest.mock("@/utils/packUserData", () => ({
  __esModule: true,
  packUserData: jest.fn((user: any) => ({ id: user._id, email: user.email })),
}));

jest.mock("@/utils/getProf", () => ({
  __esModule: true,
  getProf: jest.fn((user: any) => ({ id: user._id, email: user.email })),
}));

// User model mock
jest.mock("@/models/user", () => {
  const mockUserModel: any = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockUserModel,
  };
});

// bcrypt + jwt mocks
jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    decode: jest.fn(),
  },
}));

// axios mock for geocoding
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Require after mocks
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: controller } = require("@/modules/auth/controller");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: User } = require("@/models/user");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require("bcrypt").default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require("jsonwebtoken").default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require("axios").default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { packUserData } = require("@/utils/packUserData");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getProf } = require("@/utils/getProf");

const buildRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.locals = {};
  res.cookies = {};
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  // Provide a default geocode response so createAccount / updateProfile
  // do not throw when axios.get is not explicitly mocked in a test.
  axios.get.mockResolvedValue({ data: [{ lon: 1, lat: 2 }] });
});

// ==================== sendOTPForVerification ====================

describe("auth/controller.sendOTPForVerification", () => {
  it("returns 400 for invalid email", async () => {
    const req: any = { body: { email: "not-an-email" } };
    const res = buildRes();

    await controller.sendOTPForVerification(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 409 if user already exists", async () => {
    const req: any = { body: { email: "test@example.com" } };
    const res = buildRes();

    (User.findOne as jest.Mock).mockResolvedValueOnce({ _id: "u1" });

    await controller.sendOTPForVerification(req as Request, res as Response);

    expect(User.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("sends OTP, stores in redis and returns 200", async () => {
    const req: any = { body: { email: "test@example.com" } };
    const res = buildRes();

    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.sendOTPForVerification(req as Request, res as Response);

    expect(redisSetMock).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on unexpected error", async () => {
    const req: any = { body: { email: "test@example.com" } };
    const res = buildRes();

    (User.findOne as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.sendOTPForVerification(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("auth/controller.login in production env", () => {
  it("sets secure cookie with sameSite none when isProduction is true", async () => {
    jest.resetModules();

    jest.doMock("@/config/env", () => ({
      __esModule: true,
      default: {
        JWT_KEY: "test-jwt-key",
        SENDER_EMAIL: "sender@example.com",
        isProduction: true,
      },
    }));

    jest.doMock("@/models/user", () => ({
      __esModule: true,
      default: {
        findOne: jest.fn().mockResolvedValue({
          _id: "u1",
          email: "test@example.com",
          role: "customer",
          hashedPassword: "hashed",
        }),
      },
    }));

    jest.doMock("bcrypt", () => ({
      __esModule: true,
      default: {
        hash: jest.fn(),
        compare: jest.fn().mockResolvedValue(true),
      },
    }));

    jest.doMock("jsonwebtoken", () => ({
      __esModule: true,
      default: {
        sign: jest.fn(() => "jwt-token"),
        decode: jest.fn(),
      },
    }));

    let controllerProd: any;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      controllerProd = require("@/modules/auth/controller").default;
    });

    const req: any = {
      body: { email: "test@example.com", password: "Password123!" },
    };
    const res = buildRes();

    await controllerProd.login(req as Request, res as Response);

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "jwt-token",
      expect.objectContaining({ secure: true, sameSite: "none" })
    );
  });
});

// ==================== verifyOTPForVerification ====================

describe("auth/controller.verifyOTPForVerification", () => {
  it("returns 400 for invalid body", async () => {
    const req: any = { body: { email: "bad", OTP: "1" } };
    const res = buildRes();

    await controller.verifyOTPForVerification(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when OTP record not found", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "123456" } };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(null);

    await controller.verifyOTPForVerification(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 200 if already verified", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "123456" } };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(
      JSON.stringify({ OTP: "123456", expiry: Date.now() + 1000, isVerified: true })
    );

    await controller.verifyOTPForVerification(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 400 for incorrect OTP", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "000000" } };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(
      JSON.stringify({ OTP: "123456", expiry: Date.now() + 1000, isVerified: false })
    );

    await controller.verifyOTPForVerification(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when OTP expired", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "123456" } };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(
      JSON.stringify({ OTP: "123456", expiry: Date.now() - 1000, isVerified: false })
    );

    await controller.verifyOTPForVerification(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("verifies OTP successfully and updates redis", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "123456" } };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(
      JSON.stringify({ OTP: "123456", expiry: Date.now() + 1000, isVerified: false })
    );

    await controller.verifyOTPForVerification(req as Request, res as Response);

    expect(redisSetMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on error", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "123456" } };
    const res = buildRes();

    redisGetMock.mockRejectedValueOnce(new Error("redis-fail"));

    await controller.verifyOTPForVerification(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ==================== createAccount ====================

describe("auth/controller.createAccount", () => {
  it("returns 400 on invalid input", async () => {
    const req: any = { body: { email: "bad" } };
    const res = buildRes();

    await controller.createAccount(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when email not found in redis", async () => {
    const req: any = {
      body: {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "Password123!",
        role: "customer",
        cityName: "city",
      },
    };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(null);

    await controller.createAccount(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when email not verified", async () => {
    const req: any = {
      body: {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "Password123!",
        role: "customer",
        cityName: "city",
      },
    };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(JSON.stringify({ isVerified: false }));

    await controller.createAccount(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 409 when user already exists", async () => {
    const req: any = {
      body: {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "Password123!",
        role: "customer",
        cityName: "city",
      },
    };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(JSON.stringify({ isVerified: true }));
    axios.get.mockResolvedValueOnce({ data: [{ lon: 1, lat: 2 }] });
    (User.findOne as jest.Mock).mockResolvedValueOnce({ _id: "u1" });

    await controller.createAccount(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("creates account successfully", async () => {
    const saveMock = jest.fn();
    const req: any = {
      body: {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "Password123!",
        role: "customer",
        cityName: "city",
      },
    };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(JSON.stringify({ isVerified: true }));
    axios.get.mockResolvedValueOnce({ data: [{ lon: 1, lat: 2 }] });
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce("hashed");
    (User.create as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      save: saveMock,
    });

    await controller.createAccount(req as Request, res as Response);

    expect(User.create).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(redisDelMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 500 on error", async () => {
    const req: any = {
      body: {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "Password123!",
        role: "customer",
        cityName: "city",
      },
    };
    const res = buildRes();

    redisGetMock.mockRejectedValueOnce(new Error("redis-fail"));

    await controller.createAccount(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ==================== login ====================

describe("auth/controller.login", () => {
  it("returns 400 on invalid input", async () => {
    const req: any = { body: { email: "bad", password: "short" } };
    const res = buildRes();

    await controller.login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 401 when user not found", async () => {
    const req: any = {
      body: { email: "test@example.com", password: "Password123!" },
    };
    const res = buildRes();

    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 when password does not match", async () => {
    const req: any = {
      body: { email: "test@example.com", password: "Password123!" },
    };
    const res = buildRes();

    (User.findOne as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      email: "test@example.com",
      role: "customer",
      hashedPassword: "hashed",
    });
    bcrypt.compare.mockResolvedValueOnce(false);

    await controller.login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("logs in successfully, sets cookie and returns token", async () => {
    const req: any = {
      body: { email: "test@example.com", password: "Password123!" },
    };
    const res = buildRes();

    (User.findOne as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      email: "test@example.com",
      role: "customer",
      hashedPassword: "hashed",
    });
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValueOnce("jwt-token");

    await controller.login(req as Request, res as Response);

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "jwt-token",
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(packUserData).toHaveBeenCalled();
  });

  it("returns 500 on unexpected error", async () => {
    const req: any = {
      body: { email: "test@example.com", password: "Password123!" },
    };
    const res = buildRes();

    (User.findOne as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ==================== logout ====================

describe("auth/controller.logout", () => {
  it("returns 200 when no token cookie is present", async () => {
    const req: any = { cookies: {} };
    const res = buildRes();

    const response = await controller.logout(req as Request, res as Response);

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("returns 401 when token cannot be decoded", async () => {
    const req: any = { cookies: { token: "invalid" } };
    const res = buildRes();

    jwt.decode.mockReturnValueOnce(null);

    await controller.logout(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("blocks token in redis, clears cookie and returns 200", async () => {
    const req: any = { cookies: { token: "valid-token" } };
    const res = buildRes();

    jwt.decode.mockReturnValueOnce({ exp: Math.floor(Date.now() / 1000) + 3600 });

    await controller.logout(req as Request, res as Response);

    expect(redisSetMock).toHaveBeenCalled();
    expect(redisExpireAtMock).toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on unexpected error", async () => {
    const req: any = { cookies: { token: "valid-token" } };
    const res = buildRes();

    jwt.decode.mockImplementationOnce(() => {
      throw new Error("decode-fail");
    });

    await controller.logout(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ==================== sendOTP_resetPassword ====================

describe("auth/controller.sendOTP_resetPassword", () => {
  it("returns 400 for invalid body", async () => {
    const req: any = { body: { email: "bad" } };
    const res = buildRes();

    await controller.sendOTP_resetPassword(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when user not found", async () => {
    const req: any = { body: { email: "test@example.com" } };
    const res = buildRes();

    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.sendOTP_resetPassword(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("sends reset OTP successfully", async () => {
    const req: any = { body: { email: "test@example.com" } };
    const res = buildRes();

    (User.findOne as jest.Mock).mockResolvedValueOnce({ _id: "u1" });

    await controller.sendOTP_resetPassword(req as Request, res as Response);

    expect(redisSetMock).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on error", async () => {
    const req: any = { body: { email: "test@example.com" } };
    const res = buildRes();

    (User.findOne as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.sendOTP_resetPassword(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ==================== verifyOTP_resetPassword ====================

describe("auth/controller.verifyOTP_resetPassword", () => {
  it("returns 400 for invalid body", async () => {
    const req: any = { body: { email: "bad", OTP: "1" } };
    const res = buildRes();

    await controller.verifyOTP_resetPassword(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when OTP not found", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "123456" } };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(null);

    await controller.verifyOTP_resetPassword(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 400 when OTP is invalid", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "000000" } };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(
      JSON.stringify({ OTP: "123456", expiry: Date.now() + 1000, isVerified: false })
    );

    await controller.verifyOTP_resetPassword(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when OTP expired", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "123456" } };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(
      JSON.stringify({ OTP: "123456", expiry: Date.now() - 1000, isVerified: false })
    );

    await controller.verifyOTP_resetPassword(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("verifies OTP successfully and updates redis", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "123456" } };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(
      JSON.stringify({ OTP: "123456", expiry: Date.now() + 1000, isVerified: false })
    );

    await controller.verifyOTP_resetPassword(req as Request, res as Response);

    expect(redisSetMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on error", async () => {
    const req: any = { body: { email: "test@example.com", OTP: "123456" } };
    const res = buildRes();

    redisGetMock.mockRejectedValueOnce(new Error("redis-fail"));

    await controller.verifyOTP_resetPassword(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ==================== changePassword_resetPassword ====================

describe("auth/controller.changePassword_resetPassword", () => {
  it("returns 400 for invalid body", async () => {
    const req: any = { body: { email: "bad", newPassword: "short" } };
    const res = buildRes();

    await controller.changePassword_resetPassword(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when OTP record missing", async () => {
    const req: any = {
      body: { email: "test@example.com", newPassword: "Password123!" },
    };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(null);

    await controller.changePassword_resetPassword(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when OTP not verified", async () => {
    const req: any = {
      body: { email: "test@example.com", newPassword: "Password123!" },
    };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(
      JSON.stringify({ isVerified: false })
    );

    await controller.changePassword_resetPassword(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when user not found", async () => {
    const req: any = {
      body: { email: "test@example.com", newPassword: "Password123!" },
    };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(
      JSON.stringify({ isVerified: true })
    );
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.changePassword_resetPassword(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("changes password successfully", async () => {
    const saveMock = jest.fn();
    const req: any = {
      body: { email: "test@example.com", newPassword: "Password123!" },
    };
    const res = buildRes();

    redisGetMock.mockResolvedValueOnce(
      JSON.stringify({ isVerified: true })
    );
    (User.findOne as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      email: "test@example.com",
      save: saveMock,
    });
    bcrypt.hash.mockResolvedValueOnce("new-hash");

    await controller.changePassword_resetPassword(req as Request, res as Response);

    expect(saveMock).toHaveBeenCalled();
    expect(redisDelMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on error", async () => {
    const req: any = {
      body: { email: "test@example.com", newPassword: "Password123!" },
    };
    const res = buildRes();

    redisGetMock.mockRejectedValueOnce(new Error("redis-fail"));

    await controller.changePassword_resetPassword(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ==================== isAuthenticated ====================

describe("auth/controller.isAuthenticated", () => {
  it("returns 404 when user not found", async () => {
    const req: any = { cookies: { token: "jwt" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce(null);

    await controller.isAuthenticated(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns user data and token when authenticated", async () => {
    const req: any = { cookies: { token: "jwt" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      email: "test@example.com",
    });

    await controller.isAuthenticated(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(packUserData).toHaveBeenCalled();
  });

  it("returns 500 on error", async () => {
    const req: any = { cookies: { token: "jwt" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.isAuthenticated(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ==================== getMyProfile ====================

describe("auth/controller.getMyProfile", () => {
  it("returns 404 when user not found", async () => {
    const req: any = {};
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce(null);

    await controller.getMyProfile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns profile data when user exists", async () => {
    const req: any = {};
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      email: "test@example.com",
    });

    await controller.getMyProfile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(getProf).toHaveBeenCalled();
  });

  it("returns 500 on error", async () => {
    const req: any = {};
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.getMyProfile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ==================== updateProfile ====================

describe("auth/controller.updateProfile", () => {
  it("returns 400 for invalid body", async () => {
    const req: any = { body: { firstName: 123 } };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.updateProfile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when user not found", async () => {
    const req: any = { body: { firstName: "John" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce(null);

    await controller.updateProfile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates profile without cityName", async () => {
    const saveMock = jest.fn();
    const req: any = { body: { firstName: "New", lastName: "Name" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      firstName: "Old",
      lastName: "User",
      save: saveMock,
    });

    await controller.updateProfile(req as Request, res as Response);

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(getProf).toHaveBeenCalled();
  });

  it("updates cityName with geocoding", async () => {
    const saveMock = jest.fn();
    const req: any = { body: { cityName: "city" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      cityName: "Old",
      save: saveMock,
    });
    axios.get.mockResolvedValueOnce({ data: [{ lon: 1, lat: 2 }] });

    await controller.updateProfile(req as Request, res as Response);

    expect(axios.get).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on error", async () => {
    const req: any = { body: { firstName: "X" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.updateProfile(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
