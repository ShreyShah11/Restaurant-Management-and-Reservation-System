import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/about/page';

jest.mock('@/components/AboutHero', () => ({
  AboutHero: () => <div data-testid="about-hero">AboutHero Component</div>,
}));

jest.mock('@/components/Team', () => ({
  Team: () => <div data-testid="team">Team Component</div>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

describe('About page', () => {
  it('renders AboutHero component', () => {
    render(<AboutPage />);
    expect(screen.getByTestId('about-hero')).toBeInTheDocument();
  });

  it('renders Team component', () => {
    render(<AboutPage />);
    expect(screen.getByTestId('team')).toBeInTheDocument();
  });

  it('renders separator between sections', () => {
    render(<AboutPage />);
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });
});



