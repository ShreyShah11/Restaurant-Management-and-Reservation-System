import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivacyPage from '@/app/privacy/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

describe('Privacy page', () => {
  it('renders privacy policy title', () => {
    render(<PrivacyPage />);
    expect(screen.getAllByText(/Privacy Policy/i)[0]).toBeInTheDocument();
  });

  it('renders last updated date', () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/Last updated: November 11, 2025/i)).toBeInTheDocument();
  });

  it('renders main sections', () => {
    render(<PrivacyPage />);
    expect(screen.getAllByText(/Information We Collect/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/How We Use Your Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Information Sharing and Disclosure/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Security/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Rights and Choices/i)).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<PrivacyPage />);
    expect(screen.getAllByText(/Contact Us/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/privacy@restaurantreservation.com/i)).toBeInTheDocument();
  });

  it('renders contact page link', () => {
    render(<PrivacyPage />);
    const contactLink = screen.getByText(/Visit our Contact page/i);
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.closest('a')).toHaveAttribute('href', '/contact');
  });
});



