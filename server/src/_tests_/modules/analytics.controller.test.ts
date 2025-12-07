import { Request, Response } from "express";

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

// Booking model mock (only aggregate is used in analytics controller)
const bookingAggregateMock = jest.fn();

jest.mock("@/models/booking", () => {
  const mockBooking: any = {
    aggregate: bookingAggregateMock,
  };

  return {
    __esModule: true,
    default: mockBooking,
  };
});

// Mongoose mock (only Types.ObjectId is used, value itself is not asserted)
jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    Types: {
      ObjectId: function (this: any, id: string) {
        this.id = id;
      },
    },
  },
}));

// Require after mocks
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: controller } = require("@/modules/analytics/controller");

const buildRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("modules/analytics/controller.getDailySales", () => {
  it("returns 400 for invalid query", async () => {
    const req: any = { query: { span: 123 } };
    const res = buildRes();
    const next = jest.fn();

    await controller.getDailySales(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 200 with aggregated data", async () => {
    const req: any = { query: { span: "10" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockResolvedValueOnce([
      {
        date: "2025-01-01",
        bookings: 2,
        guests: 4,
        breakfast: { bookings: 1, guests: 2 },
        lunch: { bookings: 1, guests: 2 },
      },
    ]);

    await controller.getDailySales(req as Request, res as Response, jest.fn());

    expect(bookingAggregateMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(Array.isArray(payload.data)).toBe(true);
  });

  it("calls next and logs error on exception", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";
    const next = jest.fn();

    bookingAggregateMock.mockRejectedValueOnce(new Error("db-fail"));

    await controller.getDailySales(req as Request, res as Response, next);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});

describe("modules/analytics/controller.getForecast", () => {
  it("returns 400 for invalid query", async () => {
    const req: any = { query: { horizon: 123 } };
    const res = buildRes();

    await controller.getForecast(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 with forecast using weekday averages", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2025-01-08T00:00:00.000Z"));

    const req: any = { query: { horizon: "3" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockResolvedValueOnce([
      { date: "2025-01-01", guests: 10 },
      { date: "2025-01-08", guests: 20 },
    ]);

    await controller.getForecast(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.horizon).toBe(3);
    expect(payload.forecast).toHaveLength(3);

    jest.useRealTimers();
  });

  it("handles empty history and uses globalAvg = 0", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2025-01-08T00:00:00.000Z"));

    const req: any = { query: { horizon: "2" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockResolvedValueOnce([]);

    await controller.getForecast(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.forecast[0].guests).toBe(0);

    jest.useRealTimers();
  });

  it("returns 500 on error", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockRejectedValueOnce(new Error("db-fail"));

    await controller.getForecast(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/analytics/controller.getFunnel", () => {
  it("returns 400 for invalid query", async () => {
    const req: any = { query: { from: 123 } };
    const res = buildRes();

    await controller.getFunnel(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid date range", async () => {
    const req: any = { query: { from: "2025-01-02", to: "2025-01-01" } };
    const res = buildRes();

    await controller.getFunnel(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 with counts and conversion percentages", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockResolvedValueOnce([
      { status: "pending", count: 0 },
      { status: "accepted", count: 5 },
      { status: "payment pending", count: 3 },
      { status: "confirmed", count: 2 },
      { status: "executed", count: 1 },
      { status: "rejected", count: 4 },
    ]);

    await controller.getFunnel(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data.counts.rejected).toBe(4);
    expect(payload.data.conversions.pending_to_confirmed).toBe(0);
    expect(payload.data.conversions.confirmed_to_executed).toBeGreaterThanOrEqual(0);
    expect(payload.data.conversions.overall_to_executed).toBeGreaterThanOrEqual(0);
  });

  it("returns 500 on error", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockRejectedValueOnce(new Error("db-fail"));

    await controller.getFunnel(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/analytics/controller.getCategoryPerformance", () => {
  it("returns 400 for invalid query", async () => {
    const req: any = { query: { span: 123 } };
    const res = buildRes();

    await controller.getCategoryPerformance(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 with mapped data and avgPartySize branches", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockResolvedValueOnce([
      { category: "breakfast", bookings: 2, guests: 5 },
      { category: "lunch", bookings: 0, guests: 0 },
    ]);

    await controller.getCategoryPerformance(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    const breakfast = payload.data.find((d: any) => d.category === "breakfast");
    const lunch = payload.data.find((d: any) => d.category === "lunch");
    expect(breakfast.avgPartySize).toBeCloseTo(2.5, 2);
    expect(lunch.avgPartySize).toBe(0);
  });

  it("returns 500 on error", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockRejectedValueOnce(new Error("db-fail"));

    await controller.getCategoryPerformance(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/analytics/controller.getHeatmap", () => {
  it("returns 400 for invalid query", async () => {
    const req: any = { query: { span: 123 } };
    const res = buildRes();

    await controller.getHeatmap(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid date range", async () => {
    const req: any = { query: { from: "2025-01-02", to: "2025-01-01" } };
    const res = buildRes();

    await controller.getHeatmap(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 with heatmap data", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockResolvedValueOnce([
      { weekday: 1, hour: 10, count: 3 },
    ]);

    await controller.getHeatmap(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data[0].weekday).toBe(1);
  });

  it("returns 500 on error", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockRejectedValueOnce(new Error("db-fail"));

    await controller.getHeatmap(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/analytics/controller.getCompare", () => {
  it("returns 400 for invalid query", async () => {
    const req: any = { query: { days: 123 } };
    const res = buildRes();

    await controller.getCompare(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid date range", async () => {
    const req: any = { query: { from: "2025-01-02", to: "2025-01-01" } };
    const res = buildRes();

    await controller.getCompare(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("uses fallback span when from == to and returns comparison data", async () => {
    const req: any = { query: { from: "2025-01-01", to: "2025-01-01", days: "1" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock
      .mockResolvedValueOnce([{ bookings: 10, guests: 20 }])
      .mockResolvedValueOnce([{ bookings: 5, guests: 10 }]);

    await controller.getCompare(req as Request, res as Response);

    expect(bookingAggregateMock).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.current.bookings).toBe(10);
    expect(payload.previous.bookings).toBe(5);
    expect(payload.growth.bookings).toBeCloseTo(100);
    expect(payload.diff.bookings).toBe(5);
  });

  it("returns 500 on error", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockRejectedValueOnce(new Error("db-fail"));

    await controller.getCompare(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/analytics/controller.exportCategoryCsv", () => {
  it("returns 400 for invalid query", async () => {
    const req: any = { query: { span: 123 } };
    const res = buildRes();

    await controller.exportCategoryCsv(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns CSV with header and rows", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockResolvedValueOnce([
      { category: "breakfast", bookings: 2, guests: 5 },
      { category: "lunch", bookings: 0, guests: 0 },
    ]);

    await controller.exportCategoryCsv(req as Request, res as Response);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      expect.stringContaining("category-performance.csv")
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.send.mock.calls[0][0] as string;
    expect(body.split("\n")[0]).toBe("category,bookings,guests,avgPartySize");
  });

  it("returns 500 on error", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockRejectedValueOnce(new Error("db-fail"));

    await controller.exportCategoryCsv(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/analytics/controller.exportHeatmapCsv", () => {
  it("returns 400 for invalid query", async () => {
    const req: any = { query: { span: 123 } };
    const res = buildRes();

    await controller.exportHeatmapCsv(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid date range", async () => {
    const req: any = { query: { from: "2025-01-02", to: "2025-01-01" } };
    const res = buildRes();

    await controller.exportHeatmapCsv(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns CSV with heatmap rows", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockResolvedValueOnce([
      { weekday: 1, hour: 10, count: 3 },
    ]);

    await controller.exportHeatmapCsv(req as Request, res as Response);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      expect.stringContaining("heatmap.csv")
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.send.mock.calls[0][0] as string;
    expect(body.split("\n")[0]).toBe("weekday,hour,count");
  });

  it("returns 500 on error", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockRejectedValueOnce(new Error("db-fail"));

    await controller.exportHeatmapCsv(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/analytics/controller.getCustomerSegments", () => {
  it("returns 400 for invalid query", async () => {
    const req: any = { query: { from: 123 } };
    const res = buildRes();

    await controller.getCustomerSegments(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 without date filter when from/to missing", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    const now = new Date();
    const lastLow = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const lastMed = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
    const lastHigh = new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000);

    bookingAggregateMock.mockResolvedValueOnce([
      {
        userID: "u1",
        visits: 1,
        guests: 2,
        firstVisit: lastLow,
        lastVisit: lastLow,
        avgPartySize: 2,
      },
      {
        userID: "u2",
        visits: 3,
        guests: 6,
        firstVisit: lastMed,
        lastVisit: lastMed,
        avgPartySize: 2,
      },
      {
        userID: "u3",
        visits: 5,
        guests: 10,
        firstVisit: lastHigh,
        lastVisit: lastHigh,
        avgPartySize: 2,
      },
    ]);

    await controller.getCustomerSegments(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    const u1 = payload.data.find((r: any) => r.userID === "u1");
    const u2 = payload.data.find((r: any) => r.userID === "u2");
    const u3 = payload.data.find((r: any) => r.userID === "u3");
    expect(u1.segment).toBe("new");
    expect(u2.segment).toBe("regular");
    expect(u3.segment).toBe("loyal");
    expect(["low", "medium", "high"]).toContain(u1.churnRisk);
    expect(["low", "medium", "high"]).toContain(u2.churnRisk);
    expect(["low", "medium", "high"]).toContain(u3.churnRisk);
  });

  it("returns 200 with date filter when from/to provided", async () => {
    const req: any = { query: { from: "2025-01-01", to: "2025-02-01" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    const now = new Date();
    bookingAggregateMock.mockResolvedValueOnce([
      {
        userID: "u1",
        visits: 2,
        guests: 4,
        firstVisit: now,
        lastVisit: now,
        avgPartySize: 2,
      },
    ]);

    await controller.getCustomerSegments(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data[0].userID).toBe("u1");
  });

  it("returns 500 on error", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockRejectedValueOnce(new Error("db-fail"));

    await controller.getCustomerSegments(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/analytics/controller.exportCustomerSegmentsCsv", () => {
  it("returns 400 for invalid query", async () => {
    const req: any = { query: { from: 123 } };
    const res = buildRes();

    await controller.exportCustomerSegmentsCsv(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns CSV with customer segments", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    const now = new Date();
    const lastVisit = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

    bookingAggregateMock.mockResolvedValueOnce([
      {
        userID: "u1",
        visits: 3,
        guests: 6,
        firstVisit: now,
        lastVisit,
        avgPartySize: 2,
      },
    ]);

    await controller.exportCustomerSegmentsCsv(req as Request, res as Response);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      expect.stringContaining("customer-segments.csv")
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.send.mock.calls[0][0] as string;
    expect(body.split("\n")[0]).toBe(
      "userID,visits,guests,avgPartySize,segment,churnRisk,firstVisit,lastVisit"
    );
  });

  it("returns 500 on error", async () => {
    const req: any = { query: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    bookingAggregateMock.mockRejectedValueOnce(new Error("db-fail"));

    await controller.exportCustomerSegmentsCsv(req as Request, res as Response);

    expect(loggerMock.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
