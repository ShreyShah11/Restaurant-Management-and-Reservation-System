import sgMail from "@sendgrid/mail";

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    SENDGRID_API_KEY: "test-key",
  },
}));

jest.mock("@/utils/logger", () => ({
  __esModule: true,
  default: mockLogger,
}));

jest.mock("@sendgrid/mail", () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn().mockResolvedValue(undefined),
  },
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue(undefined),
}));

import { transporter, verifyEmailTransporter } from "@/config/nodemailer";

describe("config/nodemailer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("transporter.sendMail sets API key and sends mail", async () => {
    const mailOptions: any = { to: "user@example.com" };

    await transporter.sendMail(mailOptions);

    expect((sgMail as any).setApiKey).toHaveBeenCalledWith("test-key");
    expect((sgMail as any).send).toHaveBeenCalledWith(mailOptions);
  });

  it("verifyEmailTransporter logs success when no error", async () => {
    await verifyEmailTransporter();

    expect((sgMail as any).setApiKey).toHaveBeenCalledWith("test-key");
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Email transporter verified successfully."
    );
  });

  it("verifyEmailTransporter logs error and calls process.exit on failure", async () => {
    const originalSetApiKey = (sgMail as any).setApiKey;
    (sgMail as any).setApiKey = jest.fn(() => {
      throw new Error("fail");
    });

    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as any);

    await verifyEmailTransporter();

    expect(mockLogger.error).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    (sgMail as any).setApiKey = originalSetApiKey;
  });

  it("transporter.sendMail logs error when send throws", async () => {
    const originalSend = (sgMail as any).send;
    (sgMail as any).send = jest.fn(() => {
      throw new Error("send-fail");
    });

    const mailOptions: any = { to: "user@example.com" };

    await transporter.sendMail(mailOptions);

    expect(mockLogger.error).toHaveBeenCalled();

    (sgMail as any).send = originalSend;
  });
});
