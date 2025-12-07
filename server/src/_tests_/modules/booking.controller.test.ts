import { Request, Response } from "express";

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    SENDER_EMAIL: "sender@example.com",
    FRONTEND_URL: "https://frontend.example.com",
    RAZORPAY_KEY_SECRET: "secret",
  },
}));

const mockIoTo = jest.fn().mockReturnThis();
const mockIoEmit = jest.fn();

jest.mock("@/config/socket", () => ({
  __esModule: true,
  getIO: () => ({
    to: mockIoTo,
    emit: mockIoEmit,
  }),
}));

const mockSendMail = jest.fn();

jest.mock("@/config/nodemailer", () => ({
  __esModule: true,
  transporter: {
    sendMail: (...args: any[]) => mockSendMail(args),
  },
}));

const mockBookingAcceptedTemplate = jest.fn((..._args: any[]) => "<accepted />");
const mockBookingRejectedTemplate = jest.fn((..._args: any[]) => "<rejected />");

jest.mock("@/utils/emailTemplates", () => ({
  __esModule: true,
  bookingAcceptedTemplate: mockBookingAcceptedTemplate,
  bookingRejectedTemplate: mockBookingRejectedTemplate,
}));

const mockValidatePaymentVerification = jest.fn();

jest.mock("razorpay/dist/utils/razorpay-utils", () => ({
  __esModule: true,
  validatePaymentVerification: (...args: any[]) =>
    mockValidatePaymentVerification(args),
}));

const mockCreatePaymentLink = jest.fn();

jest.mock("@/config/razorpay", () => ({
  __esModule: true,
  razorpay: {
    paymentLink: {
      create: (...args: any[]) => mockCreatePaymentLink(args),
    },
  },
}));

const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

jest.mock("@/utils/logger", () => ({
  __esModule: true,
  default: mockLogger,
}));

jest.mock("@/models/user", () => {
  const mockUser = {
    findById: jest.fn(),
    find: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockUser,
  };
});

jest.mock("@/models/restaurant", () => {
  const mockRestaurant: any = {
    findById: jest.fn(),
    findOne: jest.fn(),
  };

  const RestaurantCtor = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  } as any;

  Object.assign(RestaurantCtor, mockRestaurant);

  return {
    __esModule: true,
    default: RestaurantCtor,
  };
});

jest.mock("@/models/booking", () => {
  const mockBookingStatics: any = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const BookingCtor = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  } as any;

  Object.assign(BookingCtor, mockBookingStatics);

  return {
    __esModule: true,
    default: BookingCtor,
  };
});

// Require after mocks
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: controller } = require("@/modules/booking/controller");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: Booking } = require("@/models/booking");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: User } = require("@/models/user");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: Restaurant } = require("@/models/restaurant");

const buildRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

describe("modules/booking/controller.createBooking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 when user not found", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce(null);

    await controller.createBooking(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 400 on validation failure", async () => {
    const req: any = {
      body: {
        restaurantID: "r1",
        bookingAt: "invalid-date",
        numberOfGuests: 0,
        category: "breakfast",
        phoneNumber: "123",
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({ _id: "u1" });

    await controller.createBooking(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when restaurant not found", async () => {
    const req: any = {
      body: {
        restaurantID: "r1",
        bookingAt: new Date().toISOString(),
        numberOfGuests: 2,
        message: "hi",
        category: "breakfast",
        phoneNumber: "1234567890",
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      firstName: "F",
      lastName: "L",
      email: "u@example.com",
    });
    (Restaurant.findById as jest.Mock).mockResolvedValueOnce(null);

    await controller.createBooking(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("creates booking successfully, emits socket event and returns 201", async () => {
    const req: any = {
      body: {
        restaurantID: "r1",
        bookingAt: new Date().toISOString(),
        numberOfGuests: 2,
        message: "hi",
        category: "breakfast",
        phoneNumber: "1234567890",
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      firstName: "F",
      lastName: "L",
      email: "u@example.com",
    });
    (Restaurant.findById as jest.Mock).mockResolvedValueOnce({ _id: "r1" });

    await controller.createBooking(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockIoTo).toHaveBeenCalledWith("restaurant-r1");
    expect(mockIoEmit).toHaveBeenCalledWith(
      "new-booking",
      expect.objectContaining({ message: "New booking received!" })
    );
  });

  it("returns 500 on unexpected error", async () => {
    const req: any = {
      body: {
        restaurantID: "r1",
        bookingAt: new Date().toISOString(),
        numberOfGuests: 2,
        message: "hi",
        category: "breakfast",
        phoneNumber: "1234567890",
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.createBooking(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/booking/controller.getBookingsByRestaurant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 when restaurant not found", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.getBookingsByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns bookings with user details and handles unknown users", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Booking.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockResolvedValueOnce([
        {
          _id: "b1",
          userID: "u1",
          restaurantID: "r1",
          bookingAt: new Date("2025-01-01T10:00:00Z"),
          numberOfGuests: 2,
          message: "msg",
          status: "pending",
          category: "breakfast",
          phoneNumber: "1234567890",
        },
        {
          _id: "b2",
          userID: "u2",
          restaurantID: "r1",
          bookingAt: new Date("2025-01-02T10:00:00Z"),
          numberOfGuests: 3,
          message: "msg2",
          status: "pending",
          category: "lunch",
          phoneNumber: "1234567890",
        },
      ]),
    });

    (User.findById as jest.Mock)
      .mockResolvedValueOnce({
        _id: "u1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      })
      .mockResolvedValueOnce(null); // unknown user for second booking

    await controller.getBookingsByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data).toHaveLength(2);
    expect(payload.data[0].fullName).toBe("John Doe");
    expect(payload.data[1].fullName).toBe("Unknown User");
    expect(payload.data[1].email).toBe("Unknown Email");
  });

  it("returns 500 on unexpected error", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Booking.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockRejectedValueOnce(new Error("db-fail")),
    });

    await controller.getBookingsByRestaurant(req as Request, res as Response);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/booking/controller.getBookingsByCustomer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 when user not found", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce(null);

    await controller.getBookingsByCustomer(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns bookings for customer", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });

    (Booking.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockResolvedValueOnce([
        {
          _id: "b1",
          userID: "u1",
          restaurantID: "r1",
          bookingAt: new Date("2025-01-01T10:00:00Z"),
          numberOfGuests: 2,
          message: "msg",
          status: "pending",
          category: "breakfast",
          phoneNumber: "1234567890",
        },
      ]),
    });

    await controller.getBookingsByCustomer(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data[0].fullName).toBe("John Doe");
  });

  it("returns 500 on unexpected error", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({ _id: "u1" });
    (Booking.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockRejectedValueOnce(new Error("db-fail")),
    });

    await controller.getBookingsByCustomer(req as Request, res as Response);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/booking/controller.changeBookingStatusR", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 on validation failure", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    await controller.changeBookingStatusR(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when booking not found", async () => {
    const req: any = { body: { bookingID: "b1", newStatus: "rejected" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Booking.findById as jest.Mock).mockResolvedValueOnce(null);

    await controller.changeBookingStatusR(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 403 when restaurant not owned by user", async () => {
    const req: any = { body: { bookingID: "b1", newStatus: "rejected" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Booking.findById as jest.Mock).mockResolvedValueOnce({
      _id: "b1",
      restaurantID: "r1",
      status: "pending",
      userID: "u1",
      bookingAt: new Date("2025-01-01T10:00:00Z"),
      category: "breakfast",
      numberOfGuests: 2,
      save: jest.fn(),
    });
    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.changeBookingStatusR(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns 400 when booking status is not pending", async () => {
    const req: any = { body: { bookingID: "b1", newStatus: "rejected" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Booking.findById as jest.Mock).mockResolvedValueOnce({
      _id: "b1",
      restaurantID: "r1",
      status: "confirmed",
      userID: "u1",
      bookingAt: new Date("2025-01-01T10:00:00Z"),
      category: "breakfast",
      numberOfGuests: 2,
      save: jest.fn(),
    });
    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });

    await controller.changeBookingStatusR(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when user not found for booking", async () => {
    const req: any = { body: { bookingID: "b1", newStatus: "rejected" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Booking.findById as jest.Mock).mockResolvedValueOnce({
      _id: "b1",
      restaurantID: "r1",
      status: "pending",
      userID: "u1",
      bookingAt: new Date("2025-01-01T10:00:00Z"),
      category: "breakfast",
      numberOfGuests: 2,
      save: jest.fn(),
    });
    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (User.findById as jest.Mock).mockResolvedValueOnce(null);

    await controller.changeBookingStatusR(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("handles rejected status: sends email, updates booking and returns 200", async () => {
    const saveMock = jest.fn();
    const booking = {
      _id: "b1",
      restaurantID: "r1",
      status: "pending",
      userID: "u1",
      bookingAt: new Date("2025-01-01T10:00:00Z"),
      category: "breakfast",
      numberOfGuests: 2,
      save: saveMock,
    };

    const req: any = { body: { bookingID: "b1", newStatus: "rejected" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Booking.findById as jest.Mock).mockResolvedValueOnce(booking);
    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });

    await controller.changeBookingStatusR(req as Request, res as Response);

    expect(mockBookingRejectedTemplate).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
    expect(booking.status).toBe("rejected");
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("handles payment pending status: creates Razorpay link, sends email and updates booking", async () => {
    const saveMock = jest.fn();
    const booking: any = {
      _id: "b1",
      restaurantID: "r1",
      status: "pending",
      userID: "u1",
      bookingAt: new Date("2025-01-01T10:00:00Z"),
      category: "breakfast",
      numberOfGuests: 2,
      paymentLinkID: null,
      paymentLinkURL: null,
      save: saveMock,
    };

    const req: any = { body: { bookingID: "b1", newStatus: "payment pending" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Booking.findById as jest.Mock).mockResolvedValueOnce(booking);
    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });

    mockCreatePaymentLink.mockResolvedValueOnce({
      id: "plink_1",
      short_url: "https://rzp.io/test",
    });

    await controller.changeBookingStatusR(req as Request, res as Response);

    expect(mockCreatePaymentLink).toHaveBeenCalled();
    expect(mockBookingAcceptedTemplate).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
    expect(booking.status).toBe("payment pending");
    expect(booking.paymentLinkID).toBe("plink_1");
    expect(booking.paymentLinkURL).toBe("https://rzp.io/test");
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on unexpected error", async () => {
    const req: any = { body: { bookingID: "b1", newStatus: "rejected" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Booking.findById as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.changeBookingStatusR(req as Request, res as Response);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/booking/controller.paymentCallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 on validation failure", async () => {
    const req: any = { body: {} };
    const res = buildRes();

    await controller.paymentCallback(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when booking not found", async () => {
    const req: any = {
      body: {
        razorpay_payment_id: "pid",
        razorpay_payment_link_id: "plink",
        razorpay_payment_link_reference_id: "ref",
        razorpay_payment_link_status: "paid",
        razorpay_signature: "sig",
      },
    };
    const res = buildRes();

    (Booking.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.paymentCallback(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("handles non-paid status by rejecting booking", async () => {
    const saveMock = jest.fn();
    const booking: any = {
      _id: "b1",
      status: "payment pending",
      paymentLinkID: "plink",
      save: saveMock,
    };

    const req: any = {
      body: {
        razorpay_payment_id: "pid",
        razorpay_payment_link_id: "plink",
        razorpay_payment_link_reference_id: "ref",
        razorpay_payment_link_status: "created",
        razorpay_signature: "sig",
      },
    };
    const res = buildRes();

    (Booking.findOne as jest.Mock).mockResolvedValueOnce(booking);

    await controller.paymentCallback(req as Request, res as Response);

    expect(booking.status).toBe("rejected");
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 400 when signature verification fails", async () => {
    const booking: any = {
      _id: "b1",
      status: "payment pending",
      paymentLinkID: "plink",
      save: jest.fn(),
    };

    const req: any = {
      body: {
        razorpay_payment_id: "pid",
        razorpay_payment_link_id: "plink",
        razorpay_payment_link_reference_id: "ref",
        razorpay_payment_link_status: "paid",
        razorpay_signature: "sig",
      },
    };
    const res = buildRes();

    (Booking.findOne as jest.Mock).mockResolvedValueOnce(booking);
    mockValidatePaymentVerification.mockReturnValueOnce(false);

    await controller.paymentCallback(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("confirms booking when signature is valid", async () => {
    const saveMock = jest.fn();
    const booking: any = {
      _id: "b1",
      status: "payment pending",
      paymentLinkID: "plink",
      save: saveMock,
    };

    const req: any = {
      body: {
        razorpay_payment_id: "pid",
        razorpay_payment_link_id: "plink",
        razorpay_payment_link_reference_id: "ref",
        razorpay_payment_link_status: "paid",
        razorpay_signature: "sig",
      },
    };
    const res = buildRes();

    (Booking.findOne as jest.Mock).mockResolvedValueOnce(booking);
    mockValidatePaymentVerification.mockReturnValueOnce(true);

    await controller.paymentCallback(req as Request, res as Response);

    expect(booking.status).toBe("confirmed");
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 500 on unexpected error", async () => {
    const req: any = {
      body: {
        razorpay_payment_id: "pid",
        razorpay_payment_link_id: "plink",
        razorpay_payment_link_reference_id: "ref",
        razorpay_payment_link_status: "paid",
        razorpay_signature: "sig",
      },
    };
    const res = buildRes();

    (Booking.findOne as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.paymentCallback(req as Request, res as Response);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("modules/booking/controller.exceuteBooking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 on validation failure", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "owner1";

    await controller.exceuteBooking(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 403 when restaurant not found", async () => {
    const req: any = { body: { bookingID: "b1" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.exceuteBooking(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns 404 when booking not found", async () => {
    const req: any = { body: { bookingID: "b1" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Booking.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.exceuteBooking(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 400 when trying to execute booking before time", async () => {
    const req: any = { body: { bookingID: "b1" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Booking.findOne as jest.Mock).mockResolvedValueOnce({
      _id: "b1",
      restaurantID: "r1",
      status: "confirmed",
      bookingAt: new Date(Date.now() + 60 * 60 * 1000), // in future
      numberOfGuests: 2,
      save: jest.fn(),
    });

    await controller.exceuteBooking(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("executes booking successfully when time has passed", async () => {
    const saveMock = jest.fn();
    const booking: any = {
      _id: "b1",
      restaurantID: "r1",
      status: "confirmed",
      bookingAt: new Date(Date.now() - 60 * 60 * 1000), // in past
      numberOfGuests: 3,
      save: saveMock,
    };

    const req: any = { body: { bookingID: "b1" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Booking.findOne as jest.Mock).mockResolvedValueOnce(booking);

    await controller.exceuteBooking(req as Request, res as Response);

    expect(booking.status).toBe("executed");
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.note).toContain(String(booking.numberOfGuests * 40));
  });

  it("returns 500 on unexpected error", async () => {
    const req: any = { body: { bookingID: "b1" } };
    const res = buildRes();
    res.locals.userID = "owner1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Booking.findOne as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.exceuteBooking(req as Request, res as Response);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
