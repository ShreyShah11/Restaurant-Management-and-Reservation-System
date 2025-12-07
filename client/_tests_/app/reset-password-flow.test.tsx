import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const resetStoreState = {
  email: "",
  OTP: "",
  password: "",
  confirmPassword: "",
};

jest.mock("@/store/reset-password", () => ({
  useResetPasswordStore: () => {
    const React = require("react");
    const [email, setEmailState] = React.useState(resetStoreState.email);
    const [OTP, setOTPState] = React.useState(resetStoreState.OTP);
    const [password, setPasswordState] = React.useState(resetStoreState.password);
    const [confirmPassword, setConfirmPasswordState] = React.useState(
      resetStoreState.confirmPassword
    );

    const setEmail = (value: string): void => {
      resetStoreState.email = value;
      setEmailState(value);
    };

    const setOTP = (value: string): void => {
      resetStoreState.OTP = value;
      setOTPState(value);
    };

    const setPassword = (value: string): void => {
      resetStoreState.password = value;
      setPasswordState(value);
    };

    const setConfirmPassword = (value: string): void => {
      resetStoreState.confirmPassword = value;
      setConfirmPasswordState(value);
    };

    const reset = (): void => {
      resetStoreState.email = "";
      resetStoreState.OTP = "";
      resetStoreState.password = "";
      resetStoreState.confirmPassword = "";
      setEmailState("");
      setOTPState("");
      setPasswordState("");
      setConfirmPasswordState("");
    };

    return {
      email,
      OTP,
      password,
      confirmPassword,
      setEmail,
      setOTP,
      setPassword,
      setConfirmPassword,
      reset,
    };
  },
}));

const mockIsAuthenticated = jest.fn(() => false);

jest.mock("@/store/user", () => ({
  useUserData: () => ({
    isAuthenticated: mockIsAuthenticated,
  }),
}));

const mockBackendPost = jest.fn();

jest.mock("@/config/backend", () => ({
  backend: {
    post: (...args: any[]) => mockBackendPost(...args),
  },
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockToastInfo = jest.fn();

jest.mock("@/components/Toast", () => ({
  Toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
    info: (...args: any[]) => mockToastInfo(...args),
  },
}));

const mockReplace = jest.fn();

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      replace: mockReplace,
    }),
  };
});

jest.mock("next/link", () => ({ children }: any) => <a>{children}</a>);

import RequestPage from "@/app/reset-password/page";
import VerifyPage from "@/app/reset-password/verify/page";
import SetPasswordPage from "@/app/reset-password/set-password/page";

const realUseState = React.useState;

const overrideSecondsState = (): (() => void) => {
  const spy = jest.spyOn(React, "useState");
  spy.mockImplementation(((initial: unknown) => {
    if (initial === 60) {
      return [0, jest.fn()] as any;
    }
    return realUseState(initial as never);
  }) as typeof React.useState);
  return () => spy.mockRestore();
};

describe("Reset Password - Request Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStoreState.email = "";
    mockIsAuthenticated.mockReturnValue(false);
  });

  test("shows validation error for empty email", async () => {
    render(<RequestPage />);

    const submitButton = screen.getByRole("button", { name: /Send Verification Code/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Email address is required/i)
    ).toBeInTheDocument();
  });

  test("shows validation error for invalid email format", async () => {
    resetStoreState.email = "invalid-email";

    render(<RequestPage />);

    const submitButton = screen.getByRole("button", { name: /Send Verification Code/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  test("clears email error on change", async () => {
    render(<RequestPage />);

    const submitButton = screen.getByRole("button", { name: /Send Verification Code/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Email address is required/i)
    ).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/Email Address/i);
    await userEvent.type(emailInput, "user@example.com");

    await waitFor(() => {
      expect(screen.queryByText(/Email address is required/i)).toBeNull();
    });
  });

  test("redirects to home if already authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(true);

    render(<RequestPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  test("successful OTP send redirects to verify page", async () => {
    resetStoreState.email = "user@example.com";
    mockBackendPost.mockResolvedValueOnce({ data: { success: true } });

    render(<RequestPage />);

    const submitButton = screen.getByRole("button", { name: /Send Verification Code/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/auth/reset-password/send-otp",
        expect.objectContaining({ email: "user@example.com" })
      );
    });

    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/reset-password/verify");
  });

  test("handles backend returning success false", async () => {
    resetStoreState.email = "user@example.com";
    mockBackendPost.mockResolvedValueOnce({ data: { success: false, message: "Not found" } });

    render(<RequestPage />);

    const submitButton = screen.getByRole("button", { name: /Send Verification Code/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Not found", expect.any(Object));
    });

    expect(mockReplace).not.toHaveBeenCalledWith("/reset-password/verify");
  });

  test("shows toast for axios error while sending OTP", async () => {
    resetStoreState.email = "user@example.com";
    mockBackendPost.mockRejectedValueOnce({ response: { data: { message: "Server issue" } } });

    render(<RequestPage />);

    const submitButton = screen.getByRole("button", { name: /Send Verification Code/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Server issue", expect.any(Object));
    });
  });

  test("shows toast when axios error has only message while sending OTP", async () => {
    resetStoreState.email = "user@example.com";
    mockBackendPost.mockRejectedValueOnce({ message: "Network issue" });

    render(<RequestPage />);

    const submitButton = screen.getByRole("button", { name: /Send Verification Code/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Network issue",
        expect.objectContaining({ description: "Please try again later." })
      );
    });
  });

  test("shows generic toast when axios error has no message or response while sending OTP", async () => {
    resetStoreState.email = "user@example.com";
    mockBackendPost.mockRejectedValueOnce({});

    render(<RequestPage />);

    const submitButton = screen.getByRole("button", { name: /Send Verification Code/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "An unexpected error occurred.",
        expect.any(Object)
      );
    });
  });
});

describe("Reset Password - Verify OTP Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStoreState.email = "user@example.com";
    resetStoreState.OTP = "";
  });

  test("redirects back to request page when email missing", async () => {
    resetStoreState.email = "";

    render(<VerifyPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/reset-password");
    });
  });

  test("validates OTP field", async () => {
    render(<VerifyPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Code/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Verification code is required/i)
    ).toBeInTheDocument();
  });

  test("clears OTP error on change", async () => {
    render(<VerifyPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Code/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Verification code is required/i)
    ).toBeInTheDocument();

    const otpInput = screen.getByLabelText(/Verification Code/i);
    await userEvent.type(otpInput, "123456");

    await waitFor(() => {
      expect(screen.queryByText(/Verification code is required/i)).toBeNull();
    });
  });

  test("successful OTP verification redirects to set-password page", async () => {
    resetStoreState.OTP = "123456";
    mockBackendPost.mockResolvedValueOnce({ data: { success: true } });

    render(<VerifyPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Code/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/auth/reset-password/verify-otp",
        expect.objectContaining({ email: "user@example.com", OTP: "123456" })
      );
    });

    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/reset-password/set-password");
  });

  test("shows error for invalid OTP length", async () => {
    resetStoreState.OTP = "123";

    render(<VerifyPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Code/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Enter a valid 6-digit code/i)
    ).toBeInTheDocument();
  });

  test("handles backend returning success false for OTP verify", async () => {
    resetStoreState.OTP = "123456";
    mockBackendPost.mockResolvedValueOnce({ data: { success: false, message: "OTP invalid" } });

    render(<VerifyPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Code/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("OTP invalid", expect.any(Object));
    });

    expect(mockReplace).not.toHaveBeenCalledWith("/reset-password/set-password");
  });

  test("handles axios error while verifying OTP", async () => {
    resetStoreState.OTP = "123456";
    mockBackendPost.mockRejectedValueOnce({ response: { data: { message: "Verify failed" } } });

    render(<VerifyPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Code/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Verify failed", expect.any(Object));
    });
  });

  test("shows toast when axios error has only message while verifying OTP", async () => {
    resetStoreState.OTP = "123456";
    mockBackendPost.mockRejectedValueOnce({ message: "Network issue" });

    render(<VerifyPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Code/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Network issue",
        expect.objectContaining({ description: "Please try again or request a new code." })
      );
    });
  });

  test("shows generic toast when axios error has no message or response while verifying OTP", async () => {
    resetStoreState.OTP = "123456";
    mockBackendPost.mockRejectedValueOnce({});

    render(<VerifyPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Code/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "An unexpected error occurred. Please try again later.",
        expect.any(Object)
      );
    });
  });

  test("allows resending OTP after timer expires", async () => {
    const restore = overrideSecondsState();
    mockBackendPost.mockResolvedValueOnce({ data: { success: true } });

    render(<VerifyPage />);

    const resendLink = await screen.findByText(/Resend OTP/i);
    await userEvent.click(resendLink);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/auth/reset-password/send-otp",
        expect.objectContaining({ email: "user@example.com" })
      );
    });

    restore();
  });

  test("resend OTP failure shows toast", async () => {
    const restore = overrideSecondsState();
    mockBackendPost.mockRejectedValueOnce(new Error("Resend error"));

    render(<VerifyPage />);

    const resendLink = await screen.findByText(/Resend OTP/i);
    await userEvent.click(resendLink);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Failed to resend OTP. Please try again later.",
        expect.any(Object)
      );
    });

    restore();
  });

  test("resend OTP backend success false shows toast", async () => {
    const restore = overrideSecondsState();
    mockBackendPost.mockResolvedValueOnce({ data: { success: false, message: "Resend failed" } });

    render(<VerifyPage />);

    const resendLink = await screen.findByText(/Resend OTP/i);
    await userEvent.click(resendLink);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Resend failed",
        expect.objectContaining({ description: "Please try again or request a new code." })
      );
    });

    restore();
  });
});

describe("Reset Password - Set Password Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStoreState.email = "user@example.com";
    resetStoreState.OTP = "123456";
    resetStoreState.password = "";
    resetStoreState.confirmPassword = "";
  });

  test("redirects back when email or OTP missing", async () => {
    resetStoreState.email = "";

    render(<SetPasswordPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/reset-password/");
    });
  });

  test("validates password and confirm password", async () => {
    render(<SetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: /Reset Password/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Password is required/i)
    ).toBeInTheDocument();
  });

  test("shows error for weak password that fails regex", async () => {
    resetStoreState.password = "short";
    resetStoreState.confirmPassword = "short";

    render(<SetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: /Reset Password/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(
        /Password must be at least 8 characters, include upper and lowercase letters, a number, and a special character/i
      )
    ).toBeInTheDocument();
  });

  test("successful password reset redirects to success page", async () => {
    resetStoreState.password = "Password1!";
    resetStoreState.confirmPassword = "Password1!";

    mockBackendPost.mockResolvedValueOnce({ data: { success: true } });

    render(<SetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: /Reset Password/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/auth/reset-password/change-password",
        expect.objectContaining({ email: "user@example.com", newPassword: "Password1!" })
      );
    });

    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/reset-password/success");
  });

  test("shows error when passwords do not match", async () => {
    resetStoreState.password = "Password1!";
    resetStoreState.confirmPassword = "Password2!";

    render(<SetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: /Reset Password/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument();
  });

  test("clears password error on change", async () => {
    render(<SetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: /Reset Password/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Password is required/i)
    ).toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/^New Password$/i);
    await userEvent.type(passwordInput, "Password1!");

    await waitFor(() => {
      expect(screen.queryByText(/Password is required/i)).toBeNull();
    });
  });

  test("clears confirm password error on change", async () => {
    resetStoreState.password = "Password1!";
    resetStoreState.confirmPassword = "";

    render(<SetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: /Reset Password/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Please confirm your password/i)
    ).toBeInTheDocument();

    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    await userEvent.type(confirmInput, "Password1!");

    await waitFor(() => {
      expect(screen.queryByText(/Please confirm your password/i)).toBeNull();
    });
  });

  test("handles backend returning success false on password reset", async () => {
    resetStoreState.password = "Password1!";
    resetStoreState.confirmPassword = "Password1!";
    mockBackendPost.mockResolvedValueOnce({ data: { success: false, message: "Denied" } });

    render(<SetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: /Reset Password/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Denied", expect.any(Object));
    });

    expect(mockReplace).not.toHaveBeenCalledWith("/reset-password/success");
  });

  test("shows toast on axios error during password reset", async () => {
    resetStoreState.password = "Password1!";
    resetStoreState.confirmPassword = "Password1!";
    mockBackendPost.mockRejectedValueOnce({ response: { data: { message: "Reset failed" } } });

    render(<SetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: /Reset Password/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Reset failed", expect.any(Object));
    });
  });

  test("shows toast when axios error has only message", async () => {
    resetStoreState.password = "Password1!";
    resetStoreState.confirmPassword = "Password1!";
    mockBackendPost.mockRejectedValueOnce({ message: "Network issue" });

    render(<SetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: /Reset Password/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Reset failed",
        expect.objectContaining({ description: "Network issue" })
      );
    });
  });

  test("shows generic toast when axios error has no message or response", async () => {
    resetStoreState.password = "Password1!";
    resetStoreState.confirmPassword = "Password1!";
    mockBackendPost.mockRejectedValueOnce({});

    render(<SetPasswordPage />);

    const submitButton = screen.getByRole("button", { name: /Reset Password/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "An unexpected error occurred",
        expect.any(Object)
      );
    });
  });
});
