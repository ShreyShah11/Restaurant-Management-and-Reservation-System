import { PASSWORD_REGEX, OTP_REGEX } from "@/constants/regex";

describe("constants/regex", () => {
  it("validates strong passwords", () => {
    expect(PASSWORD_REGEX.test("Aa1@aaaa")).toBe(true);
    expect(PASSWORD_REGEX.test("weak")).toBe(false);
  });

  it("validates 6-digit OTP", () => {
    expect(OTP_REGEX.test("123456")).toBe(true);
    expect(OTP_REGEX.test("12345")).toBe(false);
    expect(OTP_REGEX.test("abcdef")).toBe(false);
  });
});
