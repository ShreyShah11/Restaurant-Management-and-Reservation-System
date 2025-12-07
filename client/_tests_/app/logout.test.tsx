import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import LogoutPage from '@/app/logout/page';
import { backend } from '@/config/backend';
import { Toast } from '@/components/Toast';
import { useCreateAccountStore } from '@/store/create-account';
import { useLoginStore } from '@/store/login';
import { useResetPasswordStore } from '@/store/reset-password';
import { useUserData } from '@/store/user';
import { useRestaurantData } from '@/store/restaurant';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@/config/backend', () => ({
  backend: {
    post: jest.fn(),
  },
}));

jest.mock('@/components/Toast', () => ({
  Toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    message: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

jest.mock('@/store/create-account', () => ({
  useCreateAccountStore: {
    getState: jest.fn(() => ({
      reset: jest.fn(),
    })),
  },
}));

jest.mock('@/store/login', () => ({
  useLoginStore: {
    getState: jest.fn(() => ({
      reset: jest.fn(),
    })),
  },
}));

jest.mock('@/store/reset-password', () => ({
  useResetPasswordStore: {
    getState: jest.fn(() => ({
      reset: jest.fn(),
    })),
  },
}));

jest.mock('@/store/user', () => ({
  useUserData: {
    getState: jest.fn(() => ({
      reset: jest.fn(),
    })),
  },
}));

jest.mock('@/store/restaurant', () => ({
  useRestaurantData: {
    getState: jest.fn(() => ({
      reset: jest.fn(),
    })),
  },
}));

jest.mock('@/components/Loading', () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading...</div>,
}));

describe('Logout page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading page', () => {
    (backend.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    render(<LogoutPage />);
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('calls logout API on mount', async () => {
    (backend.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    render(<LogoutPage />);

    await waitFor(() => {
      expect(backend.post).toHaveBeenCalledWith('/api/v1/auth/logout');
    });
  });

  it('shows success toast on successful logout', async () => {
    (backend.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    render(<LogoutPage />);

    await waitFor(() => {
      expect(Toast.success).toHaveBeenCalledWith('You have been logged out successfully.');
    });
  });

  it('handles logout API failure', async () => {
    (backend.post as jest.Mock).mockResolvedValueOnce({
      data: { success: false, message: 'Logout failed' },
    });
    render(<LogoutPage />);

    await waitFor(() => {
      expect(Toast.error).toHaveBeenCalledWith('Logout failed', {
        description: 'There was a problem logging you out.',
      });
    });
  });

  it('handles logout API failure with no message', async () => {
    (backend.post as jest.Mock).mockResolvedValueOnce({
      data: { success: false },
    });
    render(<LogoutPage />);

    await waitFor(() => {
      expect(Toast.error).toHaveBeenCalledWith('Logout failed. Please try again.', {
        description: 'There was a problem logging you out.',
      });
    });
  });

  it('handles network errors with response data', async () => {
    (backend.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Server error' } },
    });
    render(<LogoutPage />);

    await waitFor(() => {
      expect(Toast.error).toHaveBeenCalledWith('Server error', {
        description: 'Please try again later.',
      });
    });
  });

  it('handles network errors with error message only', async () => {
    (backend.post as jest.Mock).mockRejectedValueOnce({
      message: 'Network timeout',
    });
    render(<LogoutPage />);

    await waitFor(() => {
      expect(Toast.error).toHaveBeenCalledWith('Network timeout', {
        description: 'An unexpected error occurred.',
      });
    });
  });

  it('handles unexpected errors', async () => {
    (backend.post as jest.Mock).mockRejectedValueOnce({});
    render(<LogoutPage />);

    await waitFor(() => {
      expect(Toast.error).toHaveBeenCalledWith('An unknown error occurred during logout.', {
        description: 'Please refresh the page or try again.',
      });
    });
  });

  it('resets all stores after logout attempt', async () => {
    (backend.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    const createAccountReset = jest.fn();
    const loginReset = jest.fn();
    const resetPasswordReset = jest.fn();
    const userReset = jest.fn();
    const restaurantReset = jest.fn();

    (useCreateAccountStore.getState as jest.Mock).mockReturnValue({
      reset: createAccountReset,
    });
    (useLoginStore.getState as jest.Mock).mockReturnValue({
      reset: loginReset,
    });
    (useResetPasswordStore.getState as jest.Mock).mockReturnValue({
      reset: resetPasswordReset,
    });
    (useUserData.getState as jest.Mock).mockReturnValue({
      reset: userReset,
    });
    (useRestaurantData.getState as jest.Mock).mockReturnValue({
      reset: restaurantReset,
    });

    render(<LogoutPage />);

    await waitFor(() => {
      expect(createAccountReset).toHaveBeenCalled();
      expect(loginReset).toHaveBeenCalled();
      expect(resetPasswordReset).toHaveBeenCalled();
      expect(userReset).toHaveBeenCalled();
      expect(restaurantReset).toHaveBeenCalled();
    });
  });

  it('redirects to home after logout attempt', async () => {
    (backend.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    render(<LogoutPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('redirects even when logout API fails', async () => {
    (backend.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Server error' } },
    });
    render(<LogoutPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });
});

