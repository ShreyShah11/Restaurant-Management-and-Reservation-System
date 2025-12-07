import {
  verifyEmailTemplate,
  resetPasswordVerifyTemplate,
  bookingRejectedTemplate,
  bookingAcceptedTemplate,
} from "@/utils/emailTemplates";

describe("utils/emailTemplates", () => {
  it("injects OTP into verifyEmailTemplate", () => {
    const html = verifyEmailTemplate("123456");
    expect(html).toContain("123456");
  });

  it("injects OTP into resetPasswordVerifyTemplate", () => {
    const html = resetPasswordVerifyTemplate("654321");
    expect(html).toContain("654321");
  });

  it("formats bookingRejectedTemplate with details", () => {
    const html = bookingRejectedTemplate(
      "John",
      "Doe",
      "dinner",
      "2024-01-01T10:00:00Z",
      "BOOK123",
    );

    expect(html).toContain("John Doe");
    expect(html).toContain("BOOK123");
    expect(html).toContain("Dinner");
  });

  it("formats bookingAcceptedTemplate with payment link and details", () => {
    const html = bookingAcceptedTemplate(
      "Jane",
      "Doe",
      "lunch",
      "2024-01-01T12:00:00Z",
      4,
      "BOOK456",
      "https://pay.example.com/BOOK456",
    );

    expect(html).toContain("Jane Doe");
    expect(html).toContain("BOOK456");
    expect(html).toContain("Lunch");
    expect(html).toContain("https://pay.example.com/BOOK456");
  });
});
