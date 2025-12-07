import React from 'react';
import { render, screen } from '@testing-library/react';

import LoadingPage from '@/app/loading';

jest.mock('@/components/Loading', () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading...</div>,
}));

describe('Loading page', () => {
  it('renders LoadingPage component', () => {
    render(<LoadingPage />);
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });
});



