import { describe, expect, it } from 'vitest';

import { executeToolRequest, replayRunEvents, simulateToolRun } from './runtime';

describe('deterministic tool runtime', () => {
  it('maps a known risk tool request to only approved cards', () => {
    const result = executeToolRequest({
      toolName: 'getRiskChange',
      routeId: 'route-access-review',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cards.map((card) => card.component)).toEqual([
        'risk-change-card',
        'evidence-card',
        'approval-card',
      ]);
    }
  });

  it('rejects unknown tools and known tools with unknown fixtures', () => {
    expect(
      executeToolRequest({ toolName: 'inventComponent', routeId: 'route-access-review' }),
    ).toMatchObject({
      ok: false,
      code: 'invalid-request',
    });
    expect(
      executeToolRequest({ toolName: 'getMetricSnapshot', metricId: 'metric-invented' }),
    ).toMatchObject({
      ok: false,
      code: 'not-found',
    });
  });

  it('emits an approval interrupt for the risk route', () => {
    const events = simulateToolRun({ toolName: 'getRiskChange', routeId: 'route-access-review' });

    expect(events.map((event) => event.type)).toEqual([
      'run-started',
      'card-upserted',
      'card-upserted',
      'card-upserted',
      'approval-interrupted',
    ]);
    expect(replayRunEvents(events)).toMatchObject({
      ok: true,
      state: { phase: 'awaiting-approval', cards: expect.arrayContaining([expect.anything()]) },
    });
  });

  it('emits a completed metric stream that replays deterministically', () => {
    const events = simulateToolRun({
      toolName: 'getMetricSnapshot',
      metricId: 'metric-approval-latency',
    });
    const firstReplay = replayRunEvents(events);
    const secondReplay = replayRunEvents(events);

    expect(events.map((event) => event.type)).toEqual([
      'run-started',
      'card-upserted',
      'run-completed',
    ]);
    expect(firstReplay).toEqual(secondReplay);
    expect(firstReplay).toMatchObject({ ok: true, state: { phase: 'completed' } });
  });

  it('rejects partial or cross-run event sequences', () => {
    const events = simulateToolRun({
      toolName: 'getMetricSnapshot',
      metricId: 'metric-approval-latency',
    });
    const gap = events.map((event, index) => (index === 1 ? { ...event, sequence: 4 } : event));
    const mixedRun = events.map((event, index) =>
      index === 1 ? { ...event, runId: 'run-other-run' } : event,
    );

    expect(replayRunEvents(gap)).toMatchObject({
      ok: false,
      message: expect.stringContaining('out of order'),
    });
    expect(replayRunEvents(mixedRun)).toMatchObject({
      ok: false,
      message: expect.stringContaining('different runs'),
    });
  });
});
