import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
  it('renders the controlled workspace shell', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Execution workspace' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Foundation ready');
    expect(screen.getByRole('heading', { name: 'No active run' })).toBeInTheDocument();
  });
});
