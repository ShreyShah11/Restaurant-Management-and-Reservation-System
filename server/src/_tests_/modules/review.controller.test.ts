jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    GOOGLE_GEMINI_API_KEY: "test-key",
    SENDER_EMAIL: "test@example.com",
  },
}));

jest.mock("@/models/restaurant", () => {
  const mockRestaurant = {
    findById: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockRestaurant,
  };
});

jest.mock("@/models/review", () => {
  const mockReview: any = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockReview.find = jest.fn();

  return {
    __esModule: true,
    default: mockReview,
  };
});

jest.mock("@/models/user", () => {
  const mockUser = {
    findById: jest.fn(),
    findOne: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockUser,
  };
});

jest.mock("@/utils/logger", () => {
  const mockLogger = {
    error: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockLogger,
  };
});

jest.mock("@ai-sdk/google", () => ({
  __esModule: true,
  createGoogleGenerativeAI: jest.fn(() => (modelId: string) => ({ id: modelId })),
}));

jest.mock("ai", () => ({
  __esModule: true,
  generateText: jest.fn(async () => ({ text: "**summary**" })),
}));

jest.mock("remove-markdown", () => ({
  __esModule: true,
  default: (input: string) => input.replace(/[*_`]/g, ""),
}));

const { default: controller } = require("@/modules/review/controller");
const { default: mockRestaurant } = require("@/models/restaurant");
const { default: mockReview } = require("@/models/review");
const { default: mockUser } = require("@/models/user");
const { default: mockLogger } = require("@/utils/logger");

const buildRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

describe("modules/review/controller.addReview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when validation fails", async () => {
    const req: any = { body: {} };
    const res = buildRes();

    await controller.addReview(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Invalid input" })
    );
  });

  it("returns 404 when restaurant not found", async () => {
    const req: any = { body: { restaurantID: "r1", rate: 5 }, res: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    mockRestaurant.findById.mockResolvedValueOnce(null);

    await controller.addReview(req, res);

    expect(mockRestaurant.findById).toHaveBeenCalledWith("r1");
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 403 when user is not a customer", async () => {
    const req: any = { body: { restaurantID: "r1", rate: 5 }, res: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    mockRestaurant.findById.mockResolvedValueOnce({ _id: "r1" });
    mockUser.findOne.mockResolvedValueOnce(null);

    await controller.addReview(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("creates review and updates restaurant ratings on success", async () => {
    const req: any = {
      body: { restaurantID: "r1", rate: 4, content: "nice" },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    const restaurantDoc: any = {
      _id: "r1",
      ratingsCount: 0,
      ratingsSum: 0,
      save: jest.fn(),
    };

    mockRestaurant.findById.mockResolvedValueOnce(restaurantDoc);
    mockUser.findOne.mockResolvedValueOnce({
      _id: "u1",
      role: "customer",
      firstName: "John",
      lastName: "Doe",
    });

    await controller.addReview(req, res);

    expect(restaurantDoc.ratingsCount).toBe(1);
    expect(restaurantDoc.ratingsSum).toBe(4);
    expect(restaurantDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "Review added successfully" })
    );
  });

  it("logs error and returns 500 on unexpected error", async () => {
    const req: any = {
      body: { restaurantID: "r1", rate: 4, content: "nice" },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    mockRestaurant.findById.mockRejectedValueOnce(new Error("db-fail"));

    await controller.addReview(req, res);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/review/controller.getReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 on invalid body", async () => {
    const req: any = { body: {} };
    const res = buildRes();

    await controller.getReviews(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns formatted reviews and histogram on success", async () => {
    const now = new Date();
    const reviews = [
      {
        name: "A",
        content: "good",
        rate: 5,
        createdAt: now,
      },
      {
        name: "B",
        content: "",
        rate: 4,
        createdAt: now,
      },
    ];

    (mockReview.find as jest.Mock).mockResolvedValueOnce(reviews);

    const req: any = { body: { restaurantID: "r1" } };
    const res = buildRes();

    await controller.getReviews(req, res);

    expect(mockReview.find).toHaveBeenCalledWith({ restaurantID: "r1" });
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.histogram[5]).toBe(1);
    expect(payload.histogram[4]).toBe(1);
    expect(payload.reviews.length).toBe(1); // only non-empty content
  });

  it("logs error and returns 500 on failure", async () => {
    (mockReview.find as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    const req: any = { body: { restaurantID: "r1" } };
    const res = buildRes();

    await controller.getReviews(req, res);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/review/controller.getAISummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when userID is missing", async () => {
    const req: any = { body: { restaurantID: "r1" } };
    const res = buildRes();

    await controller.getAISummary(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 400 on invalid body", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.getAISummary(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when user not found", async () => {
    const req: any = { body: { restaurantID: "r1" } };
    const res = buildRes();
    res.locals.userID = "u1";

    mockUser.findById.mockResolvedValueOnce(null);

    await controller.getAISummary(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns AI summary on success", async () => {
    const req: any = { body: { restaurantID: "r1" } };
    const res = buildRes();
    res.locals.userID = "u1";

    mockUser.findById.mockResolvedValueOnce({ _id: "u1", role: "customer" });

    const reviews = [
      { rate: 5, content: "great", createdAt: new Date(), name: "A" },
      { rate: 4, content: "", createdAt: new Date(), name: "B" },
    ];
    (mockReview.find as jest.Mock).mockResolvedValueOnce(reviews);

    const { generateText } = require("ai");
    (generateText as jest.Mock).mockResolvedValueOnce({ text: "**summary**" });

    await controller.getAISummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.summary).toBe("summary");
  });

  it("logs error and returns 500 on failure", async () => {
    const req: any = { body: { restaurantID: "r1" } };
    const res = buildRes();
    res.locals.userID = "u1";

    mockUser.findById.mockResolvedValueOnce({ _id: "u1", role: "customer" });
    (mockReview.find as jest.Mock).mockRejectedValueOnce(new Error("fail"));

    await controller.getAISummary(req, res);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
