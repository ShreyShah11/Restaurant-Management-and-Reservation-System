import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

const resetStoreState = {
  email: "",
  OTP: "",
  password: "",
  confirmPassword: "",
};

const mockReset = jest.fn(() => {
  resetStoreState.email = "";
  resetStoreState.OTP = "";
  resetStoreState.password = "";
  resetStoreState.confirmPassword = "";
});

jest.mock("@/store/reset-password", () => ({
  useResetPasswordStore: () => ({
    ...resetStoreState,
    setEmail: (v: string) => (resetStoreState.email = v),
    setOTP: (v: string) => (resetStoreState.OTP = v),
    setPassword: (v: string) => (resetStoreState.password = v),
    setConfirmPassword: (v: string) => (resetStoreState.confirmPassword = v),
    reset: mockReset,
  }),
}));

const mockPush = jest.fn();

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
  };
});

import SuccessPage from "@/app/reset-password/success/page";

describe("Reset Password - Success Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStoreState.email = "";
    resetStoreState.OTP = "";
    resetStoreState.password = "";
    resetStoreState.confirmPassword = "";
  });

  afterEach(() => {
  });

  test("redirects to /reset-password and renders nothing when required data missing", async () => {
    render(<SuccessPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/reset-password");
    });

    expect(screen.queryByText(/Password Reset Successful!/i)).toBeNull();
    expect(mockReset).not.toHaveBeenCalled();
  });

  test("renders success content when required data is present", async () => {
    resetStoreState.email = "user@example.com";
    resetStoreState.OTP = "123456";
    resetStoreState.confirmPassword = "Password1!";

    render(<SuccessPage />);

    expect(
      screen.getByText(/Password Reset Successful!/i),
    ).toBeInTheDocument();
  });
});
