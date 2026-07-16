import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
  it('renders the approved card workspace', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Approved work cards' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Catalog verified');
    expect(
      screen.getByRole('heading', { name: 'Review privileged access change' }),
    ).toBeInTheDocument();
  });
});
