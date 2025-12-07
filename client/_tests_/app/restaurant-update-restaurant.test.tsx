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

jest.mock("@/components/set-restaurant-update-form", () => ({
  __esModule: true,
  default: () => <div data-testid="multi-step-edit-form" />,
}));

import EditRestaurantPage from "@/app/restaurant/update-restaurant/page";

describe("Restaurant - Update Restaurant Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    restaurantState.restaurant = null;
  });

  test("redirects to dashboard and renders nothing when restaurant missing", async () => {
    render(<EditRestaurantPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/restaurant/dashboard");
    });

    expect(screen.queryByText(/Update Restaurant Details/i)).toBeNull();
    expect(screen.queryByTestId("multi-step-edit-form")).toBeNull();
  });

  test("renders edit page content when restaurant exists", () => {
    restaurantState.restaurant = { _id: "r1" } as any;

    render(<EditRestaurantPage />);

    expect(
      screen.getByText(/Update Restaurant Details/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("multi-step-edit-form")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

