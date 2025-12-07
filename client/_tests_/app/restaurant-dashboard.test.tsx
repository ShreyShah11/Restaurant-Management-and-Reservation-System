import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const restaurantState: any = {
  restaurant: null,
};

const mockSetRestaurant = jest.fn((r: any) => {
  restaurantState.restaurant = r;
});

jest.mock("@/store/restaurant", () => ({
  useRestaurantData: () => ({
    restaurant: restaurantState.restaurant,
    setRestaurant: mockSetRestaurant,
  }),
}));

const mockUser = { _id: "u1" } as any;

jest.mock("@/store/user", () => ({
  useUserData: () => ({
    user: mockUser,
  }),
}));

const mockBackendPost = jest.fn();

jest.mock("@/config/backend", () => ({
  backend: {
    post: (...args: any[]) => mockBackendPost(...args),
  },
}));

const mockToastError = jest.fn();

jest.mock("@/components/Toast", () => ({
  Toast: {
    error: (...args: any[]) => mockToastError(...args),
  },
}));

jest.mock("@/components/booking-alert", () => () => <div data-testid="booking-alert" />);
jest.mock("@/components/restaurant-info", () => ({
  RestaurantInfo: () => <div data-testid="restaurant-info" />,
}));
jest.mock("@/components/restaurant-about", () => ({
  RestaurantAbout: () => <div data-testid="restaurant-about" />,
}));
jest.mock("@/components/restaurant-address", () => ({
  RestaurantAddress: () => <div data-testid="restaurant-address" />,
}));

const mockPush = jest.fn();

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
  };
});

jest.mock("next/image", () => (props: any) => <img alt={props.alt || "image"} {...props} />);

import Page from "@/app/restaurant/dashboard/page";

describe("Restaurant Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    restaurantState.restaurant = null;
  });

  test("shows loading state initially", () => {
    render(<Page />);
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  test("renders not-found view when no restaurant is found", async () => {
    mockBackendPost.mockResolvedValueOnce({
      data: { success: false, found: false, restaurant: null },
    });

    render(<Page />);

    await waitFor(() => {
      expect(
        screen.getByText(/Restaurant Profile Not Found/i)
      ).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: /Add Your Restaurant/i });
    await userEvent.click(addBtn);
    expect(mockPush).toHaveBeenCalledWith("/restaurant/set-restaurant");
  });

  test("renders restaurant details and navigates via buttons when restaurant exists", async () => {
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        found: true,
        restaurant: {
          _id: "r1",
          restaurantName: "My Resto",
          bannerURL: "/banner.jpg",
          logoURL: "/logo.jpg",
          ratingsSum: 0,
          ratingsCount: 0,
          about: "About",
          address: { line1: "L1", line2: "", city: "City", zip: "123" },
          openingHours: {
            weekday: { start: "09:00 AM", end: "10:00 PM" },
            weekend: { start: "09:00 AM", end: "10:00 PM" },
          },
          status: { temporarilyClosed: false },
        },
      },
    });

    render(<Page />);

    await waitFor(() => {
      expect(mockSetRestaurant).toHaveBeenCalled();
    });

    expect(screen.getByText(/My Resto/i)).toBeInTheDocument();

    const updateBtn = screen.getByRole("button", { name: /Update Restaurant/i });
    await userEvent.click(updateBtn);
    expect(mockPush).toHaveBeenCalledWith("/restaurant/update-restaurant");

    const menuBtn = screen.getByRole("button", { name: /Manage Menu/i });
    await userEvent.click(menuBtn);
    expect(mockPush).toHaveBeenCalledWith("/restaurant/item-list");

    const bookingsBtn = screen.getByRole("button", { name: /View Bookings/i });
    await userEvent.click(bookingsBtn);
    expect(mockPush).toHaveBeenCalledWith("/restaurant/dashboard/bookings");

    const analyticsBtn = screen.getByRole("button", { name: /Analytics/i });
    await userEvent.click(analyticsBtn);
    expect(mockPush).toHaveBeenCalledWith("/restaurant/dashboard/analytics");
  });

  test("axios error path shows toast and not-found view", async () => {
    const axiosErr = {
      isAxiosError: true,
      response: { data: { message: "failure" } },
    } as any;

    mockBackendPost.mockRejectedValueOnce(axiosErr);

    render(<Page />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Restaurant not found", {
        description: "failure",
      });
    });

    expect(screen.getByText(/Restaurant Profile Not Found/i)).toBeInTheDocument();
  });
});
