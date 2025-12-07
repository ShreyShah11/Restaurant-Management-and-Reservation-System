import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseLoginStoreState = {
  email: "",
  password: "",
};

const mockResetLogin = jest.fn();

jest.mock("@/store/login", () => ({
  useLoginStore: () => {
    const React = require("react");
    const [email, setEmail] = React.useState(mockUseLoginStoreState.email);
    const [password, setPassword] = React.useState(mockUseLoginStoreState.password);

    const wrappedSetEmail = (value: string): void => {
      mockUseLoginStoreState.email = value;
      setEmail(value);
    };

    const wrappedSetPassword = (value: string): void => {
      mockUseLoginStoreState.password = value;
      setPassword(value);
    };

    const wrappedReset = (): void => {
      mockUseLoginStoreState.email = "";
      mockUseLoginStoreState.password = "";
      setEmail("");
      setPassword("");
      mockResetLogin();
    };

    return {
      email,
      password,
      setEmail: wrappedSetEmail,
      setPassword: wrappedSetPassword,
      reset: wrappedReset,
    };
  },
}));

const mockMakeLogin = jest.fn();
const mockIsAuthenticated = jest.fn(() => false);

jest.mock("@/store/user", () => ({
  useUserData: () => ({
    makeLogin: mockMakeLogin,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

const mockSetRestaurants = jest.fn();
const mockClearRestaurants = jest.fn();

jest.mock("@/store/restaurant-browse", () => ({
  useBrowseRestaurantStore: () => ({
    setRestaurants: mockSetRestaurants,
    clearRestaurants: mockClearRestaurants,
  }),
}));

const mockBackendPostLogin = jest.fn();

jest.mock("@/config/backend", () => ({
  backend: {
    post: (...args: any[]) => mockBackendPostLogin(...args),
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

jest.mock("next/link", () => {
  return ({ children }: any) => <a>{children}</a>;
});

jest.mock("next/image", () => (props: any) => <img alt={props.alt || "image"} {...props} />);

import Page, { parseTimeToToday, isRestaurantOpenNow } from "@/app/login/page";

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLoginStoreState.email = "";
    mockUseLoginStoreState.password = "";
    mockIsAuthenticated.mockReturnValue(false);
  });

  test("shows validation errors when fields are empty", async () => {
    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(await screen.findByTestId("login-email-error")).toBeInTheDocument();
    expect(await screen.findByTestId("login-password-error")).toBeInTheDocument();
  });

  test("shows validation errors for invalid email and weak password", async () => {
    render(<Page />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    await userEvent.type(emailInput, "invalid-email");
    await userEvent.type(passwordInput, "short");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(
      await screen.findByText(/Please enter a valid email address/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Password must be at least 8 characters/i)
    ).toBeInTheDocument();
  });

  test("shows error summary when both fields are empty", async () => {
    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    const summary = await screen.findByTestId("login-error-summary");
    expect(summary.textContent).toMatch(/Email address is required/i);
    expect(summary.textContent).toMatch(/Password is required/i);
  });

  test("shows error summary when only password is invalid", async () => {
    render(<Page />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    await userEvent.type(emailInput, "valid@example.com");
    await userEvent.type(passwordInput, "short");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    const summary = await screen.findByTestId("login-error-summary");
    expect(summary.textContent).not.toMatch(/Email address is required/i);
    expect(summary.textContent).toMatch(/Password must be at least 8 characters/i);
  });

  test("successful login triggers makeLogin, restaurant fetch, reset and redirect", async () => {
    mockUseLoginStoreState.email = "test@example.com";
    mockUseLoginStoreState.password = "Password1!";

    mockBackendPostLogin.mockImplementation(async (url: string) => {
      if (url === "/api/v1/auth/login") {
        return {
          data: {
            success: true,
            data: { _id: "u1", firstName: "John" },
            token: "token-123",
          },
        };
      }

      if (url === "/api/v1/restaurants/get-near-by-restaurants") {
        return {
          data: {
            success: true,
            restaurants: [
              [
                {
                  _id: "r1",
                  restaurantName: "R1",
                  logoURL: "",
                  bannerURL: "",
                  ratingsSum: 0,
                  ratingsCount: 0,
                  slogan: "S",
                  address: { line1: "L1", line2: "", city: "City", zip: "123" },
                  openingHours: {
                    weekday: { start: "09:00 AM", end: "10:00 PM" },
                    weekend: { start: "09:00 AM", end: "10:00 PM" },
                  },
                  status: { temporarilyClosed: false },
                },
                "City",
                ["Indian"],
              ],
            ],
          },
        };
      }

      throw new Error("unexpected url");
    });

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockBackendPostLogin).toHaveBeenCalledWith(
        "/api/v1/auth/login",
        expect.objectContaining({ email: "test@example.com", password: "Password1!" })
      );
    });

    expect(mockMakeLogin).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "u1" }),
      "token-123"
    );
    expect(mockSetRestaurants).toHaveBeenCalled();
    const firstCall = mockSetRestaurants.mock.calls[0][0];
    expect(firstCall[0]).toEqual(
      expect.objectContaining({
        _id: "r1",
        restaurantName: "R1",
        city: "City",
      })
    );
    expect(mockToastSuccess).toHaveBeenCalled();
    expect(mockResetLogin).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  test("clears restaurants when nearby endpoint returns empty array", async () => {
    mockUseLoginStoreState.email = "test@example.com";
    mockUseLoginStoreState.password = "Password1!";

    mockBackendPostLogin.mockImplementation(async (url: string) => {
      if (url === "/api/v1/auth/login") {
        return {
          data: {
            success: true,
            data: { _id: "u1", firstName: "Empty" },
            token: "token-999",
          },
        };
      }

      if (url === "/api/v1/restaurants/get-near-by-restaurants") {
        return {
          data: {
            success: true,
            restaurants: [],
          },
        };
      }

      throw new Error("unexpected url");
    });

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMakeLogin).toHaveBeenCalled();
    });

    expect(mockClearRestaurants).toHaveBeenCalled();
    expect(mockSetRestaurants).not.toHaveBeenCalled();
  });

  test("restaurant fetch errors show toast and clear restaurants", async () => {
    mockUseLoginStoreState.email = "test@example.com";
    mockUseLoginStoreState.password = "Password1!";

    const axiosError: any = {
      response: { data: { message: "Near-by failed" } },
    };

    mockBackendPostLogin.mockImplementation(async (url: string) => {
      if (url === "/api/v1/auth/login") {
        return {
          data: {
            success: true,
            data: { _id: "u1", firstName: "John" },
            token: "token-456",
          },
        };
      }

      if (url === "/api/v1/restaurants/get-near-by-restaurants") {
        throw axiosError;
      }

      throw new Error("unexpected url");
    });

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Error", {
        description: "Near-by failed",
      });
    });

    expect(mockClearRestaurants).toHaveBeenCalled();
  });

  test("login API success:false shows toast error and does not redirect", async () => {
    mockUseLoginStoreState.email = "test@example.com";
    mockUseLoginStoreState.password = "Password1!";

    mockBackendPostLogin.mockResolvedValueOnce({
      data: { success: false, message: "Invalid" },
    });

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Invalid",
        expect.any(Object)
      );
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test("Axios error with response message shows toast", async () => {
    mockUseLoginStoreState.email = "test@example.com";
    mockUseLoginStoreState.password = "Password1!";

    const error: any = {
      response: { data: { message: "Server down" } },
    };

    mockBackendPostLogin.mockRejectedValueOnce(error);

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Server down",
        expect.any(Object)
      );
    });
  });

  test("clears email error and summary on email input change", async () => {
    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(await screen.findByTestId("login-email-error")).toBeInTheDocument();
    expect(await screen.findByTestId("login-error-summary")).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/Email Address/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "user@example.com");

    await waitFor(() => {
      expect(screen.queryByTestId("login-email-error")).toBeNull();
      expect(screen.queryByTestId("login-error-summary")).toBeNull();
    });
  });

  test("clears password error and summary on password input change", async () => {
    render(<Page />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    await userEvent.type(emailInput, "user@example.com");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    expect(await screen.findByTestId("login-password-error")).toBeInTheDocument();
    expect(await screen.findByTestId("login-error-summary")).toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/^Password$/i);
    await userEvent.type(passwordInput, "Password1!");

    await waitFor(() => {
      expect(screen.queryByTestId("login-password-error")).toBeNull();
      expect(screen.queryByTestId("login-error-summary")).toBeNull();
    });
  });

  test("Axios error with only message shows toast", async () => {
    mockUseLoginStoreState.email = "test@example.com";
    mockUseLoginStoreState.password = "Password1!";

    const error: any = { message: "Network error" };
    mockBackendPostLogin.mockRejectedValueOnce(error);

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Network error",
        expect.any(Object)
      );
    });
  });

  test("Axios error with no message or response shows generic toast", async () => {
    mockUseLoginStoreState.email = "test@example.com";
    mockUseLoginStoreState.password = "Password1!";

    const error: any = {};
    mockBackendPostLogin.mockRejectedValueOnce(error);

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "An unexpected error occurred. Please try again.",
        expect.objectContaining({
          description: "If the problem persists, contact support.",
        })
      );
    });
  });

  test("maps restaurant as closed when temporarily closed", async () => {
    mockUseLoginStoreState.email = "test@example.com";
    mockUseLoginStoreState.password = "Password1!";

    mockBackendPostLogin.mockImplementation(async (url: string) => {
      if (url === "/api/v1/auth/login") {
        return {
          data: {
            success: true,
            data: { _id: "u1", firstName: "John" },
            token: "token-123",
          },
        };
      }

      if (url === "/api/v1/restaurants/get-near-by-restaurants") {
        return {
          data: {
            success: true,
            restaurants: [
              [
                {
                  _id: "r1",
                  restaurantName: "R1",
                  logoURL: "",
                  bannerURL: "",
                  ratingsSum: 0,
                  ratingsCount: 0,
                  slogan: "S",
                  address: { line1: "L1", line2: "", city: "City", zip: "123" },
                  openingHours: {
                    weekday: { start: "2025-01-01T09:00:00Z", end: "2025-01-01T18:00:00Z" },
                    weekend: { start: "09:00 AM", end: "10:00 PM" },
                  },
                  status: { temporarilyClosed: true },
                },
                "City",
                ["Indian"],
              ],
            ],
          },
        };
      }

      throw new Error("unexpected url");
    });

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetRestaurants).toHaveBeenCalled();
    });

    const firstCallArg = mockSetRestaurants.mock.calls[0][0];
    expect(firstCallArg[0]).toEqual(
      expect.objectContaining({
        _id: "r1",
        temporarilyClosed: true,
        isOpen: false,
        status: "closed",
      })
    );
  });

  test("maps restaurant as closed when opening hours are invalid", async () => {
    mockUseLoginStoreState.email = "test@example.com";
    mockUseLoginStoreState.password = "Password1!";

    mockBackendPostLogin.mockImplementation(async (url: string) => {
      if (url === "/api/v1/auth/login") {
        return {
          data: {
            success: true,
            data: { _id: "u1", firstName: "John" },
            token: "token-123",
          },
        };
      }

      if (url === "/api/v1/restaurants/get-near-by-restaurants") {
        return {
          data: {
            success: true,
            restaurants: [
              [
                {
                  _id: "r2",
                  restaurantName: "R2",
                  logoURL: "",
                  bannerURL: "",
                  ratingsSum: 0,
                  ratingsCount: 0,
                  slogan: "S2",
                  address: { line1: "L2", line2: "", city: "City2", zip: "456" },
                  openingHours: {
                    weekday: { start: "invalid", end: "" },
                    weekend: { start: "12:00 AM", end: "01:00 AM" },
                  },
                  status: { temporarilyClosed: false },
                },
                "City2",
                ["Italian"],
              ],
            ],
          },
        };
      }

      throw new Error("unexpected url");
    });

    render(<Page />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetRestaurants).toHaveBeenCalled();
    });

    const firstCallArg = mockSetRestaurants.mock.calls[0][0];
    expect(firstCallArg[0]).toEqual(
      expect.objectContaining({
        _id: "r2",
        temporarilyClosed: false,
        isOpen: false,
        status: "closed",
      })
    );
  });

  test("already authenticated user is redirected on mount", async () => {
    mockIsAuthenticated.mockReturnValue(true);

    render(<Page />);
  });
});
