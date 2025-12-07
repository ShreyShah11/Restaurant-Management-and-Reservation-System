describe('callback page placeholder', () => {
  it('has at least one test', () => {
    expect(true).toBe(true);
  });
});

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AxiosError } from "axios";

const mockReplace = jest.fn();
const mockPush = jest.fn();
let mockSearchParams: Record<string, string | undefined> = {};

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      replace: mockReplace,
      push: mockPush,
    }),
    useSearchParams: () => ({
      get: (key: string) => mockSearchParams[key] ?? null,
    }),
  };
});

jest.mock("@/config/backend", () => ({
  backend: {
    post: (...args: any[]) => mockBackendPost(...args),
  },
}));

jest.mock("@/components/Toast", () => ({
  Toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

jest.mock("lucide-react", () => {
  const actual = jest.requireActual("lucide-react");
  return {
    ...actual,
    Loader2: (props: any) => <div data-testid="loader" {...props} />, // simplify
  };
});

import Page from "@/app/callback/page";

const mockBackendPost = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

const setSearchParams = (overrides: Partial<Record<string, string>> = {}) => {
  mockSearchParams = {
    razorpay_payment_id: "pay_123",
    razorpay_payment_link_id: "plink_123",
    razorpay_payment_link_reference_id: "ref_123",
    razorpay_payment_link_status: "paid",
    razorpay_signature: "sig_123",
    ...overrides,
  };
};

describe("Callback Page full behaviour", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSearchParams();
  });

  test("renders loading spinner initially", () => {
    render(<Page />);
    expect(screen.getByText(/Verifying Payment/i)).toBeInTheDocument();
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  test("handles missing required payment params and redirects home", async () => {
    setSearchParams({ razorpay_payment_id: undefined });

    render(<Page />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Invalid payment callback");
    });

    expect(mockReplace).toHaveBeenCalledWith("/");
    expect(screen.getByText(/Payment Failed/i)).toBeInTheDocument();
  });

  test("successful payment with bookingDone true shows success UI and booking details", async () => {
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        bookingDone: true,
        bookingId: "BKG1",
      },
    });

    render(<Page />);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/booking/payment-callback",
        expect.objectContaining({
          razorpay_payment_id: "pay_123",
          razorpay_payment_link_id: "plink_123",
          razorpay_signature: "sig_123",
        })
      );
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Booking completed successfully"
    );

    expect(
      await screen.findByText(/Payment Successful!/i)
    ).toBeInTheDocument();
    expect(screen.getByText("BKG1")).toBeInTheDocument();
    expect(screen.getByText("pay_123")).toBeInTheDocument();
    expect(screen.getByText("paid")).toBeInTheDocument();
  });

  test("successful call but bookingDone false shows rejection UI and toast", async () => {
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        bookingDone: false,
      },
    });

    render(<Page />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Payment not completed, booking rejected"
      );
    });

    expect(screen.getByText(/Payment Failed/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Payment not completed, booking rejected/i)
    ).toBeInTheDocument();
  });

  test("backend returns success: false triggers error toast and failure UI", async () => {
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: false,
        bookingDone: false,
      },
    });

    render(<Page />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Payment verification failed");
    });

    expect(screen.getByText(/Payment Failed/i)).toBeInTheDocument();
  });

  test("Axios error with response message is shown via toast and UI", async () => {
    const axiosError: Partial<AxiosError<{ message: string }>> = {
      response: {
        data: { message: "Server says no" },
      } as any,
    };

    mockBackendPost.mockRejectedValueOnce(axiosError);

    render(<Page />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Server says no");
    });

    expect(screen.getByText(/Payment Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Server says no/i)).toBeInTheDocument();
  });

  test("Generic error uses fallback toast message", async () => {
    const axiosError: Partial<AxiosError> = {
      message: "Something broke",
    };
    mockBackendPost.mockRejectedValueOnce(axiosError);

    render(<Page />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Something went wrong");
    });

    expect(screen.getByText(/Payment Failed/i)).toBeInTheDocument();
  });

  test("Go to Home button calls router correctly on success screen", async () => {
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        bookingDone: true,
        bookingId: "BKG1",
      },
    });

    render(<Page />);

    await screen.findByText(/Payment Successful!/i);

    const viewBookings = await screen.findByRole("button", { name: /View Bookings/i });
    await userEvent.click(viewBookings);

    const goHome = screen.getByRole("button", { name: /Go to Home/i });
    await userEvent.click(goHome);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });
});
