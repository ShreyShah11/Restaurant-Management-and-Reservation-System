import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactPage from '@/app/contact/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

describe('Contact page', () => {
  it('renders contact page title', () => {
    render(<ContactPage />);
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });

  it('renders contact information cards', () => {
    render(<ContactPage />);
    expect(screen.getByText(/Our Location/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Legal & Privacy/i)).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<ContactPage />);
    expect(screen.getByText(/Connect With Us/i)).toBeInTheDocument();
    expect(screen.getByText(/Twitter/i)).toBeInTheDocument();
    expect(screen.getByText(/Facebook/i)).toBeInTheDocument();
    expect(screen.getByText(/LinkedIn/i)).toBeInTheDocument();
    expect(screen.getByText(/GitHub/i)).toBeInTheDocument();
  });

  it('renders contact details', () => {
    render(<ContactPage />);
    expect(screen.getByText(/Dharmsinh Desai University/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 \(123\) 456-7890/i)).toBeInTheDocument();
    expect(screen.getByText(/info@restaurantreservation.com/i)).toBeInTheDocument();
  });

  it('renders privacy and terms links', () => {
    render(<ContactPage />);
    const privacyLink = screen.getByText(/Read Privacy Policy/i);
    const termsLink = screen.getByText(/View Terms/i);
    
    expect(privacyLink).toBeInTheDocument();
    expect(termsLink).toBeInTheDocument();
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
  });
});



