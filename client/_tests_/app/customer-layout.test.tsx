import React from 'react';
import { render, screen } from '@testing-library/react';

import CustomerLayout from '@/app/customer/layout';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockUserStore: { user: any } = {
  user: null,
};

jest.mock('@/store/user', () => ({
  useUserData: () => mockUserStore,
}));

jest.mock('@/components/Loading', () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading...</div>,
}));

describe('app/customer/layout', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUserStore.user = null;
  });

  it('redirects to /login and shows loading when user is not set', () => {
    render(
      <CustomerLayout>
        <div data-testid="child">Child</div>
      </CustomerLayout>,
    );

    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('renders children when user is a customer and does not redirect', () => {
    mockUserStore.user = {
      _id: 'u1',
      firstName: 'Test',
      lastName: 'User',
      email: 't@example.com',
      createdAt: 'now',
      role: 'customer',
    };

    render(
      <CustomerLayout>
        <div data-testid="child">Child</div>
      </CustomerLayout>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects to /login when user role is not customer but still renders children', () => {
    mockUserStore.user = {
      _id: 'u2',
      firstName: 'Owner',
      lastName: 'User',
      email: 'o@example.com',
      createdAt: 'now',
      role: 'owner',
    };

    render(
      <CustomerLayout>
        <div data-testid="child">Child</div>
      </CustomerLayout>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});

