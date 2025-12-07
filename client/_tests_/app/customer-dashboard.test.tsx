import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";

// =========================
// SAFE Mocks (top-level)
// =========================

// next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// next/image -> simple <img>
jest.mock("next/image", () => (props: any) => <img {...props} alt={props.alt || "image"} />);

// backend
const mockBackendPost = jest.fn();
jest.mock("@/config/backend", () => ({
  backend: {
    post: (...args: any[]) => mockBackendPost(...args),
  },
}));

// Toast
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock("@/components/Toast", () => ({
  Toast: {
    error: (...args: any[]) => mockToastError(...args),
    success: (...args: any[]) => mockToastSuccess(...args),
  },
}));

// =========================
// USER STORE MOCK (works like a tiny in-memory store)
// =========================

let mockUser: any = null;
let mockBookings: any[] = [];

/**
 * IMPORTANT: mockSetBookings must update the shared `mockBookings` variable
 * so that when the component reads bookings from the mocked hook, it sees the new value.
 */
const mockSetBookings = jest.fn((newBookings) => {
  mockBookings = Array.isArray(newBookings) ? newBookings : [];
});

jest.mock("@/store/user", () => ({
  useUserData: () => ({
    user: mockUser,
    bookings: mockBookings,
    setBookings: mockSetBookings,
  }),
}));

// Restaurant browse store
const mockGetRestaurantById = jest.fn();
jest.mock("@/store/restaurant-browse", () => ({
  useBrowseRestaurantStore: () => ({
    getRestaurantById: mockGetRestaurantById,
  }),
}));

// Component under test (must be imported after mocks)
import UserDashboardPage from "@/app/customer/dashboard/page";

// -------------------------
// helpers
// -------------------------
const makeBooking = (overrides: Partial<any> = {}) => ({
  _id: overrides._id ?? Math.random().toString(36).slice(2),
  restaurantID: overrides.restaurantID ?? "rest-1",
  bookingAt: overrides.bookingAt ?? new Date().toISOString(),
  numberOfGuests: overrides.numberOfGuests ?? 2,
  status: overrides.status ?? "pending",
  ...overrides,
});

// Reset environment between tests
beforeEach(() => {
  jest.clearAllMocks();

  mockUser = { _id: "u1", firstName: "Test", role: "customer" };
  mockBookings = [];
  mockSetBookings.mockClear();
  mockBackendPost.mockReset();
  mockGetRestaurantById.mockReset();
  mockToastError.mockReset();
  mockToastSuccess.mockReset();
  mockPush.mockReset();
  mockReplace.mockReset();
});

// =========================
// Tests
// =========================
describe("UserDashboardPage (customer dashboard)", () => {
  test("shows loading spinner initially", () => {
    render(<UserDashboardPage />);
    expect(screen.getByText(/Loading your dashboard/i)).toBeInTheDocument();
  });


  test("handles backend errors and shows toast error", async () => {
    mockBackendPost.mockRejectedValueOnce(new Error("Network failure"));

    render(<UserDashboardPage />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });

    // after error, loading should be gone
    expect(screen.queryByText(/Loading your dashboard/i)).not.toBeInTheDocument();
  });

  test("handles API success:false path and shows toast error", async () => {
    const bookings: any[] = [];
    mockBackendPost.mockResolvedValueOnce({ data: { success: false, data: bookings, message: "nope" } });

    render(<UserDashboardPage />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Failed to load bookings", expect.objectContaining({ description: "nope" }));
    });

    // setBookings should not be called with data from failing response
    expect(mockSetBookings).not.toHaveBeenCalledWith(bookings);
  });

  test("tab switching: upcoming/past/cancelled lists update properly", async () => {
    const now = new Date();
    const bookings = [
      makeBooking({ bookingAt: dayjs(now).add(1, "day").toISOString(), status: "confirmed", restaurantID: "A" }), // upcoming
      makeBooking({ bookingAt: dayjs(now).add(3, "day").toISOString(), status: "pending", restaurantID: "B" }), // upcoming (pending allowed)
      makeBooking({ bookingAt: dayjs(now).subtract(1, "day").toISOString(), status: "confirmed", restaurantID: "C" }), // past
      makeBooking({ bookingAt: dayjs(now).add(2, "day").toISOString(), status: "rejected", restaurantID: "D" }), // cancelled
    ];

    mockBackendPost.mockResolvedValueOnce({ data: { success: true, data: bookings } });

    mockGetRestaurantById.mockImplementation((id: string) => ({
      restaurantName: `Rest-${id}`,
      slogan: "S",
      bannerURL: "/banner.jpg",
      address: { street: "S", city: "C" },
    }));

    render(<UserDashboardPage />);

    await waitFor(() => expect(screen.queryByText(/Loading your dashboard/i)).not.toBeInTheDocument());

    // Upcoming should contain A and B
    expect(screen.getByText("Rest-A")).toBeInTheDocument();
    expect(screen.getByText("Rest-B")).toBeInTheDocument();

    // Switch to Past
    await userEvent.click(screen.getByRole("tab", { name: /past/i }));
    expect(await screen.findByText("Rest-C")).toBeInTheDocument();

    // Switch to Cancelled
    await userEvent.click(screen.getByRole("tab", { name: /cancelled/i }));
    expect(await screen.findByText("Rest-D")).toBeInTheDocument();
  });

  test("pending booking shows ping animation and status badge contains status text", async () => {
    const now = new Date();
    const bookings = [makeBooking({ bookingAt: dayjs(now).add(1, "day").toISOString(), status: "pending", restaurantID: "A" })];

    mockBackendPost.mockResolvedValueOnce({ data: { success: true, data: bookings } });

    mockGetRestaurantById.mockReturnValue({
      restaurantName: "Rest-A",
      slogan: "Ping",
      bannerURL: "/x.jpg",
      address: { street: "S", city: "C" },
    });

    render(<UserDashboardPage />);

    await waitFor(() => expect(screen.queryByText(/Loading your dashboard/i)).not.toBeInTheDocument());

    // Badge text "pending" exists somewhere (it might be split due to icon)
    expect(screen.getByText((txt) => txt.toLowerCase().includes("pending"))).toBeTruthy();

    // ping animation element should be present
    expect(document.querySelector(".animate-ping")).not.toBeNull();

    // ensure status color class applied to badge container (bg-orange-100 for "pending")
    // We can find the badge by locating the text node and then finding its parent with the class
    const pendingNode = screen.getByText((txt) => txt.toLowerCase().includes("pending"));
    const badgeParent = pendingNode.closest(".bg-orange-100, .text-orange-700, .border-orange-300, .bg-yellow-100, .bg-green-100, .bg-red-100");
    expect(badgeParent).toBeTruthy();
  });


  test("does not call backend when user is null", async () => {
    mockUser = null;

    render(<UserDashboardPage />);

    // backend.post should not be called because effect checks user?._id
    expect(mockBackendPost).not.toHaveBeenCalled();
  });

  test("profile button navigates to profile page", async () => {
    // Provide empty bookings so component renders and profile button exists
    mockBackendPost.mockResolvedValueOnce({ data: { success: true, data: [] } });
    mockGetRestaurantById.mockReturnValue(undefined);

    render(<UserDashboardPage />);

    await waitFor(() => expect(screen.queryByText(/Loading your dashboard/i)).not.toBeInTheDocument());

    const profileBtn = screen.getByRole("button", { name: /profile/i });
    await userEvent.click(profileBtn);
    expect(mockPush).toHaveBeenCalledWith("/customer/dashboard/profile");
  });
});
