import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

jest.mock('@/components/FAQs', () => ({
  FAQs: () => <div data-testid="faqs">FAQs Component</div>,
}));

jest.mock('@/components/Feature', () => ({
  Feature: () => <div data-testid="feature">Feature Component</div>,
}));

jest.mock('@/components/Food-Item-Slider', () => ({
  FoodItemSlider: () => <div data-testid="food-item-slider">FoodItemSlider Component</div>,
}));

jest.mock('@/components/hero-section', () => ({
  HeroSection: () => <div data-testid="hero-section">HeroSection Component</div>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

describe('Home page', () => {
  it('renders all main components', () => {
    render(<HomePage />);
    
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('feature')).toBeInTheDocument();
    expect(screen.getByTestId('food-item-slider')).toBeInTheDocument();
    expect(screen.getByTestId('faqs')).toBeInTheDocument();
  });

  it('renders separators between sections', () => {
    render(<HomePage />);
    
    const separators = screen.getAllByTestId('separator');
    expect(separators.length).toBeGreaterThan(0);
  });
});



