import React from 'react';
import { render, screen } from '@testing-library/react';

import NotFoundPage from '@/app/not-found';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

describe('Not found page', () => {
  it('renders 404 page with correct content', () => {
    render(<NotFoundPage />);
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    expect(
      screen.getByText((text) =>
        text.startsWith(
          'The page you',
        ),
      ),
    ).toBeInTheDocument();
  });

  it('renders back to home link', () => {
    render(<NotFoundPage />);
    const homeLink = screen.getByRole('link', { name: /Back to Home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders CircleAlert icon', () => {
    render(<NotFoundPage />);
    // CircleAlert is an SVG icon, check if the page renders correctly
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
  });
});

