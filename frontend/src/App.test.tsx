import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Conversational Data System/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders role selector', () => {
  render(<App />);
  const labelElement = screen.getByText(/User Role:/i);
  expect(labelElement).toBeInTheDocument();
});
