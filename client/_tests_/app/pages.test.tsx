import React from 'react';
import { render, screen } from '@testing-library/react';

import HomePage from '@/app/page';
import AboutPage from '@/app/about/page';
import ContactPage from '@/app/contact/page';
import TermsPage from '@/app/terms/page';
import PrivacyPage from '@/app/privacy/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt as string} {...props} />
  ),
}));

jest.mock('@/components/hero-section', () => ({
  HeroSection: () => <section data-testid="hero-section">Hero Section</section>,
}));

jest.mock('@/components/Feature', () => ({
  Feature: () => <section data-testid="feature-section">Features</section>,
}));

jest.mock('@/components/Food-Item-Slider', () => ({
  FoodItemSlider: () => <section data-testid="food-slider">Food Slider</section>,
}));

jest.mock('@/components/FAQs', () => ({
  FAQs: () => <section data-testid="faq-section">FAQs</section>,
}));

jest.mock('@/components/AboutHero', () => ({
  AboutHero: () => <section data-testid="about-hero">About Hero</section>,
}));

jest.mock('@/components/Team', () => ({
  Team: () => <section data-testid="team-section">Team</section>,
}));

describe('App directory pages', () => {
  it('renders the home page sections in order', () => {
    render(<HomePage />);
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('feature-section')).toBeInTheDocument();
    expect(screen.getByTestId('food-slider')).toBeInTheDocument();
    expect(screen.getByTestId('faq-section')).toBeInTheDocument();
  });

  it('renders about page hero and team details', () => {
    render(<AboutPage />);
    expect(screen.getByTestId('about-hero')).toBeInTheDocument();
    expect(screen.getByTestId('team-section')).toBeInTheDocument();
  });

  it('renders key sections of the contact page', () => {
    render(<ContactPage />);
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Location/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect With Us/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /GitHub/i })).toHaveAttribute(
      'href',
      'https://github.com/IamDevTrivedi/Resturant-Management-System',
    );
  });

  it('renders the terms of service highlights', () => {
    render(<TermsPage />);
    expect(screen.getAllByText(/Terms of Service/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Acceptance of Terms/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Termination/i)[0]).toBeInTheDocument();
  });

  it('renders the privacy policy sections', () => {
    render(<PrivacyPage />);
    expect(screen.getAllByText(/Privacy Policy/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Information We Collect/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Contact Us/i)[0]).toBeInTheDocument();
  });
});

