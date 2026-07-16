import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SpecificationEvidence } from './SpecificationEvidence';

describe('SpecificationEvidence', () => {
  it('shows the accepted and rejected specification counts', () => {
    render(<SpecificationEvidence />);

    expect(screen.getByText('Boundary holds')).toBeInTheDocument();
    expect(screen.getByText(/4 approved specifications/i)).toBeInTheDocument();
    expect(screen.getByText(/4 invalid specifications/i)).toBeInTheDocument();
    expect(screen.getByText(/unsafeLink/i)).toBeInTheDocument();
  });
});
