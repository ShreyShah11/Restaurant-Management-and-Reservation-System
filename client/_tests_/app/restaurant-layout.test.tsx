import React from "react";
import { render, screen } from "@testing-library/react";

// -----------------------------
// Mocks
// -----------------------------

const mockUserState: { user: any } = {
  user: null,
};

jest.mock("@/store/user", () => ({
  useUserData: () => mockUserState,
}));

const mockReplace = jest.fn();

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({ replace: mockReplace }),
  };
});

jest.mock("@/components/Loading", () => ({
  LoadingPage: () => <div data-testid="loading-page" />,
}));

import RootLayout from "@/app/restaurant/layout";

// -----------------------------
// Tests
// -----------------------------

describe("Restaurant RootLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserState.user = null;
  });

  test("redirects unauthenticated user and shows loading page", () => {
    mockUserState.user = null;

    render(
      <RootLayout>
        <div data-testid="child" />
      </RootLayout>,
    );

    // For no user, both conditions in useEffect are true, so replace is invoked twice
    expect(mockReplace).toHaveBeenNthCalledWith(1, "/login");
    expect(mockReplace).toHaveBeenNthCalledWith(2, "/");

    // While redirecting, layout renders LoadingPage
    expect(screen.getByTestId("loading-page")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeNull();
  });

  test("redirects customer user to home and shows loading page", () => {
    mockUserState.user = { _id: "u1", role: "customer" } as any;

    render(
      <RootLayout>
        <div data-testid="child" />
      </RootLayout>,
    );

    // First condition (!user) is false, second (!user || role == 'customer') is true
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/");

    expect(screen.getByTestId("loading-page")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeNull();
  });

  test("renders children without redirect when user is restaurant owner", () => {
    mockUserState.user = { _id: "u1", role: "owner" } as any;

    render(
      <RootLayout>
        <div data-testid="child" />
      </RootLayout>,
    );

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByTestId("loading-page")).toBeNull();
  });
});
