import crypto from "crypto";
import generateOTP from "@/utils/generateOTP";

describe("utils/generateOTP", () => {
  it("returns a 6-digit zero-padded string", () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(6);
    expect(otp).toMatch(/^\d{6}$/);
  });

  it("respects crypto.randomInt output boundaries", () => {
    const spy = jest.spyOn(crypto, "randomInt").mockReturnValue(42 as any);
    const otp = generateOTP();
    expect(otp).toBe("000042");
    spy.mockRestore();
  });
});
