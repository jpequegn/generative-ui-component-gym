import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { simulateToolRun } from '../domain/runtime';
import { streamFrame } from '../domain/stream-frame';
import { StreamConsole } from './StreamConsole';

describe('streamFrame', () => {
  it('reveals approval cards only at the approval interrupt', () => {
    const events = simulateToolRun({ toolName: 'getRiskChange', routeId: 'route-access-review' });

    expect(streamFrame(events, 4).visibleCards.map((card) => card.component)).toEqual([
      'risk-change-card',
      'evidence-card',
    ]);
    expect(streamFrame(events, 5).visibleCards.map((card) => card.component)).toEqual([
      'risk-change-card',
      'evidence-card',
      'approval-card',
    ]);
  });

  it('resets to idle when replay is rewound', () => {
    const events = simulateToolRun({
      toolName: 'getMetricSnapshot',
      metricId: 'metric-approval-latency',
    });

    expect(streamFrame(events, 0).state.phase).toBe('idle');
  });
});

describe('StreamConsole', () => {
  it('steps through an interrupt and clears it on replay', () => {
    render(<StreamConsole />);

    fireEvent.click(screen.getByRole('button', { name: 'Run risk review' }));
    expect(screen.getByText('running')).toBeInTheDocument();

    const next = screen.getByRole('button', { name: 'Apply next event' });
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);

    expect(screen.getByText('awaiting approval')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Approve privileged access change' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Replay stream' }));
    expect(screen.getByText('idle')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Approve privileged access change' }),
    ).not.toBeInTheDocument();
  });

  it('shows completed and failed terminal states', () => {
    render(<StreamConsole />);

    fireEvent.click(screen.getByRole('button', { name: 'Run metric snapshot' }));
    const next = screen.getByRole('button', { name: 'Apply next event' });
    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByText('completed')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Simulate failed run' }));
    expect(screen.getByText('failed')).toBeInTheDocument();
    expect(screen.getByText(/No synthetic metric matches/i)).toBeInTheDocument();
  });
});
