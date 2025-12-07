import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const storeState = {
  email: "",
  OTP: "",
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
  role: "customer" as "customer" | "owner",
  cityName: "",
};

const mockSetters = {
  setFirstName: jest.fn((v: string) => (storeState.firstName = v)),
  setLastName: jest.fn((v: string) => (storeState.lastName = v)),
  setPassword: jest.fn((v: string) => (storeState.password = v)),
  setConfirmPassword: jest.fn((v: string) => (storeState.confirmPassword = v)),
  setRole: jest.fn((v: "customer" | "owner") => (storeState.role = v)),
  setCityName: jest.fn((v: string) => (storeState.cityName = v)),
};

jest.mock("@/store/create-account", () => ({
  useCreateAccountStore: () => ({
    ...storeState,
    ...mockSetters,
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

jest.mock("@/components/Toast", () => ({
  Toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
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

import Page from "@/app/create-account/set-profile/page";

describe("Create Account - Set Profile Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storeState.email = "test@example.com";
    storeState.OTP = "123456";
    storeState.firstName = "";
    storeState.lastName = "";
    storeState.password = "";
    storeState.confirmPassword = "";
    storeState.role = "customer";
    storeState.cityName = "";
  });

  test("redirects to /create-account when email or OTP missing", async () => {
    storeState.email = "";

    render(<Page />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/create-account");
    });
  });

  test("validates fields and shows errors for invalid input", async () => {
    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /Save Profile/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/First name must be at least 2 characters/i)
    ).toBeInTheDocument();
  });

  test("successful profile creation calls backend and redirects", async () => {
    storeState.firstName = "John";
    storeState.lastName = "Doe";
    storeState.password = "Password1!";
    storeState.confirmPassword = "Password1!";
    storeState.role = "customer";
    storeState.cityName = "City";

    mockBackendPost.mockResolvedValueOnce({ data: { success: true } });

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /Save Profile/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/auth/create-account",
        expect.objectContaining({
          email: storeState.email,
          firstName: "John",
          lastName: "Doe",
          password: "Password1!",
          role: "customer",
          cityName: "City",
        })
      );
    });

    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/create-account/success");
  });

  test("backend returns success false shows toast error and does not redirect", async () => {
    storeState.firstName = "John";
    storeState.lastName = "Doe";
    storeState.password = "Password1!";
    storeState.confirmPassword = "Password1!";
    storeState.role = "customer";
    storeState.cityName = "City";

    mockBackendPost.mockResolvedValueOnce({ data: { success: false, message: "Denied" } });

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /Save Profile/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Denied",
        expect.objectContaining({ description: expect.any(String) })
      );
    });

    expect(mockReplace).not.toHaveBeenCalledWith("/create-account/success");
  });

  test("axios error prefers error.message when present", async () => {
    storeState.firstName = "John";
    storeState.lastName = "Doe";
    storeState.password = "Password1!";
    storeState.confirmPassword = "Password1!";
    storeState.role = "customer";
    storeState.cityName = "City";

    const errorWithMessage: any = { message: "Network error" };
    mockBackendPost.mockRejectedValueOnce(errorWithMessage);

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /Save Profile/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Network error",
        expect.objectContaining({ description: expect.any(String) })
      );
    });
  });

  test("axios error uses response message when message absent", async () => {
    storeState.firstName = "John";
    storeState.lastName = "Doe";
    storeState.password = "Password1!";
    storeState.confirmPassword = "Password1!";
    storeState.role = "customer";
    storeState.cityName = "City";

    const errorWithResponseOnly: any = { response: { data: { message: "Server issue" } } };
    mockBackendPost.mockRejectedValueOnce(errorWithResponseOnly);

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /Save Profile/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Server issue",
        expect.objectContaining({ description: expect.any(String) })
      );
    });
  });

  test("axios error falls back to default message when neither message nor response present", async () => {
    storeState.firstName = "John";
    storeState.lastName = "Doe";
    storeState.password = "Password1!";
    storeState.confirmPassword = "Password1!";
    storeState.role = "customer";
    storeState.cityName = "City";

    const genericError: any = {};
    mockBackendPost.mockRejectedValueOnce(genericError);

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /Save Profile/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "An unexpected error occurred.",
        expect.objectContaining({ description: expect.any(String) })
      );
    });
  });

  test("role validation error is shown and cleared when selecting a role, and city name error clears on input", async () => {
    storeState.firstName = "John";
    storeState.lastName = "Doe";
    storeState.password = "Password1!";
    storeState.confirmPassword = "Password1!";
    storeState.role = "" as any;
    storeState.cityName = "";

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /Save Profile/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Please select a valid role/i)
    ).toBeInTheDocument();

    const ownerRadio = screen.getByLabelText(/Restaurant Owner/i);
    await userEvent.click(ownerRadio);

    await waitFor(() => {
      expect(screen.queryByText(/Please select a valid role/i)).toBeNull();
    });

    expect(storeState.role).toBe("owner");

    // city name error path
    expect(
      await screen.findByText(/Please enter you city name/i)
    ).toBeInTheDocument();

    const cityInput = screen.getByLabelText(/City Name/i);
    await userEvent.type(cityInput, "Mumbai");

    await waitFor(() => {
      expect(screen.queryByText(/Please enter you city name/i)).toBeNull();
    });
  });

  test("field errors clear on input changes including password mismatch", async () => {
    // Start with values that trigger validation including password mismatch
    storeState.firstName = "J"; // too short
    storeState.lastName = "D"; // too short
    storeState.password = "weak"; // invalid password
    storeState.confirmPassword = "different"; // mismatch
    storeState.role = "" as any; // invalid role so role error appears
    storeState.cityName = ""; // to keep city error path consistent

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /Save Profile/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/First name must be at least 2 characters/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Last name must be at least 2 characters/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Please select a valid role/i)
    ).toBeInTheDocument();

    // Now type valid values to hit all onChange handlers and clear errors
    const firstNameInput = screen.getByLabelText(/First Name/i);
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "John");

    const lastNameInput = screen.getByLabelText(/Last Name/i);
    await userEvent.clear(lastNameInput);
    await userEvent.type(lastNameInput, "Doe");

    const passwordInput = screen.getByLabelText(/^Password$/i);
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "Password1!");

    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    await userEvent.clear(confirmPasswordInput);
    await userEvent.type(confirmPasswordInput, "Password1!");

    const customerRadio = screen.getByLabelText(/Customer/i);
    await userEvent.click(customerRadio);

    await waitFor(() => {
      expect(
        screen.queryByText(/First name must be at least 2 characters/i)
      ).toBeNull();
      expect(
        screen.queryByText(/Last name must be at least 2 characters/i)
      ).toBeNull();
      // Only confirm the mismatch error clears; the static password hint stays rendered
      expect(screen.queryByText(/Passwords do not match/i)).toBeNull();
      expect(screen.queryByText(/Please select a valid role/i)).toBeNull();
    });
  });
});
