import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

const restaurantState: any = {
  restaurant: null,
};

jest.mock("@/store/restaurant", () => ({
  useRestaurantData: () => ({
    restaurant: restaurantState.restaurant,
  }),
}));

const mockReplace = jest.fn();

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({ replace: mockReplace }),
  };
});

jest.mock("@/components/set-restaurant-form", () => ({
  MultiStepRestaurantForm: () => <div data-testid="multi-step-form" />,
}));

jest.mock("@/components/Loading", () => ({
  LoadingPage: () => <div data-testid="loading-page" />,
}));

import AddRestaurantPage from "@/app/restaurant/set-restaurant/page";

describe("Restaurant - Set Restaurant Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    restaurantState.restaurant = null;
  });

  test("renders form when restaurant does not exist", () => {
    render(<AddRestaurantPage />);

    expect(screen.getByTestId("multi-step-form")).toBeInTheDocument();
    expect(screen.queryByTestId("loading-page")).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test("redirects to dashboard and shows loading when restaurant already exists", async () => {
    restaurantState.restaurant = { _id: "r1" } as any;

    render(<AddRestaurantPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/restaurant/dashboard");
    });

    expect(screen.getByTestId("loading-page")).toBeInTheDocument();
    expect(screen.queryByTestId("multi-step-form")).toBeNull();
  });
});

