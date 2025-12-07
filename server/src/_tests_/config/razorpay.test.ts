const mockRazorpayConstructor = jest.fn();

jest.mock("razorpay", () => {
  return jest.fn().mockImplementation((options) => {
    mockRazorpayConstructor(options);
    return { options };
  });
});

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    RAZORPAY_KEY_ID: "key-id",
    RAZORPAY_KEY_SECRET: "key-secret",
  },
}));

import { razorpay } from "@/config/razorpay";

describe("config/razorpay", () => {
  it("initializes Razorpay instance with config keys", () => {
    expect(mockRazorpayConstructor).toHaveBeenCalledWith({
      key_id: "key-id",
      key_secret: "key-secret",
    });
    expect((razorpay as any).options).toEqual({
      key_id: "key-id",
      key_secret: "key-secret",
    });
  });
});
