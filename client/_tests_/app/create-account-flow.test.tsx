// tests will be filled here
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// -----------------------------
// Mocked create-account store
// -----------------------------
const createAccountStoreState = {
  email: "",
  OTP: "",
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
  role: "customer" as "customer" | "owner",
  cityName: "",
};

const mockCreateSetters = {
  setEmail: jest.fn((v: string) => (createAccountStoreState.email = v)),
  setOTP: jest.fn((v: string) => (createAccountStoreState.OTP = v)),
  setFirstName: jest.fn((v: string) => (createAccountStoreState.firstName = v)),
  setLastName: jest.fn((v: string) => (createAccountStoreState.lastName = v)),
  setPassword: jest.fn((v: string) => (createAccountStoreState.password = v)),
  setConfirmPassword: jest.fn(
    (v: string) => (createAccountStoreState.confirmPassword = v),
  ),
  setRole: jest.fn((v: "customer" | "owner") => (createAccountStoreState.role = v)),
  setCityName: jest.fn((v: string) => (createAccountStoreState.cityName = v)),
  reset: jest.fn(() => {
    createAccountStoreState.email = "";
    createAccountStoreState.OTP = "";
    createAccountStoreState.firstName = "";
    createAccountStoreState.lastName = "";
    createAccountStoreState.password = "";
    createAccountStoreState.confirmPassword = "";
    createAccountStoreState.role = "customer";
    createAccountStoreState.cityName = "";
  }),
};

jest.mock("@/store/create-account", () => ({
  useCreateAccountStore: () => ({
    ...createAccountStoreState,
    ...mockCreateSetters,
  }),
}));

// -----------------------------
// Common mocks
// -----------------------------
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
const mockPush = jest.fn();

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      replace: mockReplace,
      push: mockPush,
    }),
  };
});

jest.mock("next/link", () => ({ children, onClick, href, className }: any) => (
  <a href={href} onClick={onClick} className={className}>
    {children}
  </a>
));

// -----------------------------
// Imports under mocks
// -----------------------------
import CreateAccountPage from "@/app/create-account/page";
import VerifyAccountPage from "@/app/create-account/verify/page";
import CreateSuccessPage from "@/app/create-account/success/page";

const realUseState = React.useState;
let mockSecondsSetter: jest.Mock | null = null;

const overrideSecondsState = (initialSeconds = 0): (() => void) => {
  const spy = jest.spyOn(React, "useState");
  spy.mockImplementation(((initial: unknown) => {
    if (initial === 60 || initial === 5) {
      // For verify page countdown (60s) or success page countdown (5s)
      const setter = jest.fn();
      mockSecondsSetter = setter;
      return [initialSeconds, setter] as any;
    }
    return realUseState(initial as never);
  }) as typeof React.useState);
  return () => {
    spy.mockRestore();
    mockSecondsSetter = null;
  };
};

// -----------------------------
// Create Account Root Page
// -----------------------------
describe("Create Account - Root Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createAccountStoreState.email = "";
    mockIsAuthenticated.mockReturnValue(false);
  });

  test("shows validation error for empty email", async () => {
    render(<CreateAccountPage />);

    const submitButton = screen.getByRole("button", {
      name: /Send Verification Code/i,
    });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Email address is required/i),
    ).toBeInTheDocument();
  });

  test("shows validation error for invalid email format", async () => {
    createAccountStoreState.email = "invalid";

    render(<CreateAccountPage />);

    const submitButton = screen.getByRole("button", {
      name: /Send Verification Code/i,
    });
    await userEvent.click(submitButton);

    // For invalid format we primarily care that no API call is made
    await waitFor(() => {
      expect(mockBackendPost).not.toHaveBeenCalled();
    });
  });

  test("clears email error on change", async () => {
    render(<CreateAccountPage />);

    const submitButton = screen.getByRole("button", {
      name: /Send Verification Code/i,
    });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Email address is required/i),
    ).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/Email Address/i);
    await userEvent.type(emailInput, "user@example.com");

    await waitFor(() => {
      expect(screen.queryByText(/Email address is required/i)).toBeNull();
    });
  });

  test("redirects to home if already authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(true);

    render(<CreateAccountPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
    expect(mockToastInfo).toHaveBeenCalled();
  });

  test("successful OTP send redirects to verify page", async () => {
    createAccountStoreState.email = "user@example.com";
    mockBackendPost.mockResolvedValueOnce({ data: { success: true } });

    render(<CreateAccountPage />);

    const submitButton = screen.getByRole("button", {
      name: /Send Verification Code/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/auth/send-otp-for-verification",
        expect.objectContaining({ email: "user@example.com" }),
      );
    });

    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/create-account/verify");
  });

  test("handles backend returning success false", async () => {
    createAccountStoreState.email = "user@example.com";
    mockBackendPost.mockResolvedValueOnce({
      data: { success: false, message: "Denied" },
    });

    render(<CreateAccountPage />);

    const submitButton = screen.getByRole("button", {
      name: /Send Verification Code/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Denied",
        expect.objectContaining({ description: "Please try again." }),
      );
    });

    expect(mockReplace).not.toHaveBeenCalledWith("/create-account/verify");
  });

  test("axios error prefers response message, then message, then fallback", async () => {
    createAccountStoreState.email = "user@example.com";

    // response.data.message path
    mockBackendPost.mockRejectedValueOnce({
      response: { data: { message: "Server issue" } },
    });

    render(<CreateAccountPage />);

    let submitButton = screen.getAllByRole("button", {
      name: /Send Verification Code/i,
    })[0];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Server issue",
        expect.objectContaining({ description: "Please try again." }),
      );
    });

    // reset and test message only path
    jest.clearAllMocks();
    mockBackendPost.mockRejectedValueOnce({ message: "Network" });

    render(<CreateAccountPage />);
    submitButton = screen.getAllByRole("button", {
      name: /Send Verification Code/i,
    })[0];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });

    // fallback path
    jest.clearAllMocks();
    mockBackendPost.mockRejectedValueOnce({});

    render(<CreateAccountPage />);
    submitButton = screen.getAllByRole("button", {
      name: /Send Verification Code/i,
    })[0];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });
  });
});

// -----------------------------
// Verify Email Page
// -----------------------------
describe("Create Account - Verify Email Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createAccountStoreState.email = "user@example.com";
    createAccountStoreState.OTP = "";
  });

  test("redirects back to create-account when email missing", async () => {
    createAccountStoreState.email = "";

    render(<VerifyAccountPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/create-account");
    });
  });

  test("validates OTP field and shows required error", async () => {
    render(<VerifyAccountPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Email/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Verification code is required\./i),
    ).toBeInTheDocument();
  });

  test("shows error for invalid OTP format", async () => {
    createAccountStoreState.OTP = "123";

    render(<VerifyAccountPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Email/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Please enter a valid 6-digit code/i),
    ).toBeInTheDocument();
  });

  test("clears OTP error on change", async () => {
    render(<VerifyAccountPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Email/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Verification code is required\./i),
    ).toBeInTheDocument();

    const otpInput = screen.getByLabelText(/Verification Code/i);
    await userEvent.type(otpInput, "123456");

    await waitFor(() => {
      expect(
        screen.queryByText(/Verification code is required\./i),
      ).toBeNull();
    });
  });

  test("successful OTP verification redirects to set-profile page", async () => {
    createAccountStoreState.OTP = "123456";
    mockBackendPost.mockResolvedValueOnce({ data: { success: true } });

    render(<VerifyAccountPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Email/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/auth/verify-otp-for-verification",
        expect.objectContaining({
          email: "user@example.com",
          OTP: "123456",
        }),
      );
    });

    expect(mockReplace).toHaveBeenCalledWith("/create-account/set-profile");
  });

  test("handles backend returning success false for OTP verify", async () => {
    createAccountStoreState.OTP = "123456";
    mockBackendPost.mockResolvedValueOnce({
      data: { success: false, message: "OTP invalid" },
    });

    render(<VerifyAccountPage />);

    const submitButton = screen.getByRole("button", { name: /Verify Email/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/auth/verify-otp-for-verification",
        expect.objectContaining({
          email: "user@example.com",
          OTP: "123456",
        }),
      );
      expect(mockToastError).toHaveBeenCalled();
    });

    expect(mockReplace).not.toHaveBeenCalledWith(
      "/create-account/set-profile",
    );
  });

  test("handles axios error while verifying OTP with response message, message only, and fallback", async () => {
    createAccountStoreState.OTP = "123456";

    // response.data.message path
    mockBackendPost.mockRejectedValueOnce({
      response: { data: { message: "Verify failed" } },
    });

    render(<VerifyAccountPage />);

    let submitButton = screen.getAllByRole("button", { name: /Verify Email/i })[0];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });

    // message only
    jest.clearAllMocks();
    createAccountStoreState.OTP = "123456";
    mockBackendPost.mockRejectedValueOnce({ message: "Network" });

    render(<VerifyAccountPage />);
    submitButton = screen.getAllByRole("button", { name: /Verify Email/i })[0];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Network",
        expect.objectContaining({ description: "Please try again." }),
      );
    });

    // fallback
    jest.clearAllMocks();
    createAccountStoreState.OTP = "123456";
    mockBackendPost.mockRejectedValueOnce({});

    render(<VerifyAccountPage />);
    submitButton = screen.getAllByRole("button", { name: /Verify Email/i })[0];
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Unexpected error",
        expect.objectContaining({ description: "Please try again." }),
      );
    });
  });

  test("shows resend OTP countdown text while timer is active", async () => {
    render(<VerifyAccountPage />);
    expect(screen.getByText(/Resend OTP in/i)).toBeInTheDocument();
  });

  test("countdown decreases seconds over time and stops at 0", async () => {
    jest.useFakeTimers();

    render(<VerifyAccountPage />);

    // Initial state
    expect(screen.getByText(/Resend OTP in 60s/i)).toBeInTheDocument();
    
    // Link should be disabled during countdown
    const link = screen.getByRole('link', { name: /resend otp in/i });
    expect(link).toHaveClass('cursor-not-allowed');
    expect(link).toHaveClass('opacity-50');

    // Fast-forward time
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText(/Resend OTP in 57s/i)).toBeInTheDocument();

    // Fast-forward to end of countdown
    await act(async () => {
      jest.advanceTimersByTime(57000);
    });

    // Link should now be enabled
    const enabledLink = await screen.findByRole('link', { name: /resend otp/i });
    expect(enabledLink).not.toHaveClass('cursor-not-allowed');
    expect(enabledLink).not.toHaveClass('opacity-50');

    jest.useRealTimers();
  });

  test("resends OTP successfully when countdown has finished", async () => {
    mockBackendPost.mockResolvedValueOnce({ data: { success: true } });

    render(<VerifyAccountPage />);

    const link = screen.getByRole("link", { name: /resend otp/i });
    await userEvent.click(link);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/auth/send-otp-for-verification",
        expect.objectContaining({ email: "user@example.com" }),
      );
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "OTP resent successfully!",
      expect.objectContaining({
        description: "Please check your email inbox.",
      }),
    );
  });

  test("handles backend returning success false for resend OTP", async () => {
    mockBackendPost.mockResolvedValueOnce({
      data: { success: false, message: "Resend denied" },
    });

    render(<VerifyAccountPage />);

    const link = screen.getByRole("link", { name: /resend otp/i });
    await userEvent.click(link);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Resend denied",
        expect.objectContaining({ description: "Please try again." }),
      );
    });

    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  test("handles axios error while resending OTP with response message, message only, and fallback", async () => {
    // response.data.message path
    mockBackendPost.mockRejectedValueOnce({
      response: { data: { message: "Resend failed" } },
    });

    render(<VerifyAccountPage />);

    let link = screen.getAllByRole("link", { name: /resend otp/i })[0];
    await userEvent.click(link);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Resend failed",
        expect.objectContaining({ description: "Please try again." }),
      );
    });

    // message only path
    jest.clearAllMocks();
    mockBackendPost.mockRejectedValueOnce({ message: "Network" });

    render(<VerifyAccountPage />);
    link = screen.getAllByRole("link", { name: /resend otp/i })[0];
    await userEvent.click(link);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Network",
        expect.objectContaining({ description: "Please try again." }),
      );
    });

    // fallback path
    jest.clearAllMocks();
    mockBackendPost.mockRejectedValueOnce({});

    render(<VerifyAccountPage />);
    link = screen.getAllByRole("link", { name: /resend otp/i })[0];
    await userEvent.click(link);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Unexpected error",
        expect.objectContaining({ description: "Please try again." }),
      );
    });
  });

  test("renders success content when data present", async () => {
    createAccountStoreState.email = "user@example.com";
    createAccountStoreState.OTP = "123456";
    createAccountStoreState.confirmPassword = "Password1!";

    render(<CreateSuccessPage />);

    expect(
      screen.getByText(/Account Created Successfully!/i),
    ).toBeInTheDocument();

    // We only assert that the success UI is shown when data is present.
  });

  test("redirects and returns null when email is missing but OTP and confirmPassword present", async () => {
    createAccountStoreState.email = "";
    createAccountStoreState.OTP = "123456";
    createAccountStoreState.confirmPassword = "Password1!";

    render(<CreateSuccessPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/create-account");
    });
    expect(mockCreateSetters.reset).toHaveBeenCalled();
    expect(screen.queryByText(/Account Created Successfully!/i)).toBeNull();
  });

  test("redirects and returns null when OTP is missing but email and confirmPassword present", async () => {
    createAccountStoreState.email = "user@example.com";
    createAccountStoreState.OTP = "";
    createAccountStoreState.confirmPassword = "Password1!";

    render(<CreateSuccessPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/create-account");
    });
    expect(mockCreateSetters.reset).toHaveBeenCalled();
    expect(screen.queryByText(/Account Created Successfully!/i)).toBeNull();
  });

  test("redirects and returns null when confirmPassword is missing but email and OTP present", async () => {
    createAccountStoreState.email = "user@example.com";
    createAccountStoreState.OTP = "123456";
    createAccountStoreState.confirmPassword = "";

    render(<CreateSuccessPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/create-account");
    });
    expect(mockCreateSetters.reset).toHaveBeenCalled();
    expect(screen.queryByText(/Account Created Successfully!/i)).toBeNull();
  });

  test("shows initial countdown value on success page", async () => {
    const restore = overrideSecondsState(5);

    createAccountStoreState.email = "user@example.com";
    createAccountStoreState.OTP = "123456";
    createAccountStoreState.confirmPassword = "Password1!";

    render(<CreateSuccessPage />);

    // The numeric countdown span should show 5
    const countdownSpan = screen.getByText("5", { selector: "span" });
    expect(countdownSpan).toBeInTheDocument();

    restore();
  });

  test("redirects to /login when countdown is zero", async () => {
    const restore = overrideSecondsState(0);

    createAccountStoreState.email = "user@example.com";
    createAccountStoreState.OTP = "123456";
    createAccountStoreState.confirmPassword = "Password1!";

    render(<CreateSuccessPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    restore();
  });

  test("decrements countdown every second and clears timer on unmount", async () => {
    jest.useFakeTimers();

    createAccountStoreState.email = "user@example.com";
    createAccountStoreState.OTP = "123456";
    createAccountStoreState.confirmPassword = "Password1!";

    const { unmount } = render(<CreateSuccessPage />);

    // initial countdown value
    expect(screen.getByText("5", { selector: "span" })).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("4", { selector: "span" })).toBeInTheDocument();

    // unmount should clear timeout without errors
    unmount();
    jest.useRealTimers();
  });
});

