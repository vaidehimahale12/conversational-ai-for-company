import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Conversational Data Hub/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders sidebar title', () => {
  render(<App />);
  const sidebarTitle = screen.getByText(/DataChat AI/i);
  expect(sidebarTitle).toBeInTheDocument();
});
