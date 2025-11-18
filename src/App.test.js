import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './components/Home';

test('renders navbar title Hirify', () => {
  render(<Home />);
  expect(screen.getByText('Hirify')).toBeInTheDocument();
});
