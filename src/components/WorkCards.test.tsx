import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { validCardSpecs } from '../domain/fixtures';
import { WorkCardGrid } from './WorkCards';

describe('WorkCardGrid', () => {
  it('renders each approved work card', () => {
    render(<WorkCardGrid specs={validCardSpecs} />);

    expect(
      screen.getByRole('heading', { name: 'Review privileged access change' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Median approval latency' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Review evidence' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Approve privileged access change' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /synthetic change expands access/i })).toHaveAttribute(
      'href',
      'https://evidence.example.test/access/diff',
    );
  });

  it('blocks invalid specifications without rendering their arbitrary payload', () => {
    render(
      <WorkCardGrid
        specs={[
          {
            id: 'bad-card',
            component: 'runtime-html',
            data: { html: '<button>Run arbitrary HTML</button>' },
          },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Card blocked' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Run arbitrary HTML' })).not.toBeInTheDocument();
  });
});
