import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
  it('renders the replayable run workspace', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Live run' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Replay ready');
    expect(screen.getByRole('button', { name: 'Run risk review' })).toBeInTheDocument();
  });
});
