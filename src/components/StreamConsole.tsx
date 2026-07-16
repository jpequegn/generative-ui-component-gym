import { useMemo, useState } from 'react';

import { simulateToolRun, type RunEvent, type RunState } from '../domain/runtime';
import { streamFrame } from '../domain/stream-frame';
import { WorkCardGrid } from './WorkCards';

type ScenarioId = 'risk' | 'metric' | 'failure';

const scenarios: Record<ScenarioId, { label: string; request: unknown }> = {
  risk: {
    label: 'Run risk review',
    request: { toolName: 'getRiskChange', routeId: 'route-access-review' },
  },
  metric: {
    label: 'Run metric snapshot',
    request: { toolName: 'getMetricSnapshot', metricId: 'metric-approval-latency' },
  },
  failure: {
    label: 'Simulate failed run',
    request: { toolName: 'getMetricSnapshot', metricId: 'metric-unavailable' },
  },
};

function phaseLabel(phase: RunState['phase']): string {
  return phase.replace('-', ' ');
}

function eventLabel(event: RunEvent): string {
  switch (event.type) {
    case 'run-started':
      return 'Run started';
    case 'card-upserted':
      return `Card received: ${event.card.component}`;
    case 'approval-interrupted':
      return 'Approval interrupt';
    case 'run-completed':
      return 'Run completed';
    case 'run-failed':
      return 'Run failed';
  }
}

export function StreamConsole() {
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const frame = useMemo(() => streamFrame(events, eventCount), [eventCount, events]);

  function startScenario(id: ScenarioId) {
    const nextEvents = simulateToolRun(scenarios[id].request);
    setEvents(nextEvents);
    setEventCount(1);
  }

  function advance() {
    setEventCount((count) => Math.min(count + 1, events.length));
  }

  function replay() {
    setEventCount(0);
  }

  const canAdvance = eventCount < events.length;

  return (
    <section className="stream-console" aria-label="Replayable event stream">
      <header className="stream-toolbar">
        <div className="scenario-actions" aria-label="Run scenarios">
          {(Object.keys(scenarios) as ScenarioId[]).map((id) => (
            <button
              className="scenario-button"
              key={id}
              onClick={() => startScenario(id)}
              type="button"
            >
              {scenarios[id].label}
            </button>
          ))}
        </div>
        <div className="stream-status" aria-live="polite">
          <span className={`phase-indicator phase-indicator--${frame.state.phase}`}>
            {phaseLabel(frame.state.phase)}
          </span>
          <span>
            {eventCount}/{events.length} events
          </span>
        </div>
      </header>

      <div className="stream-layout">
        <section className="stream-events" aria-labelledby="stream-events-title">
          <div className="panel-heading">
            <h2 id="stream-events-title">Event stream</h2>
            <div className="stream-controls">
              <button
                className="icon-command"
                disabled={!canAdvance}
                onClick={advance}
                title="Apply next event"
                type="button"
              >
                <span aria-hidden="true">›</span>
                <span className="sr-only">Apply next event</span>
              </button>
              <button
                className="icon-command"
                disabled={eventCount === 0}
                onClick={replay}
                title="Replay stream"
                type="button"
              >
                <span aria-hidden="true">↺</span>
                <span className="sr-only">Replay stream</span>
              </button>
            </div>
          </div>
          {frame.events.length === 0 ? <p className="stream-empty">No events received</p> : null}
          {frame.events.length > 0 ? (
            <ol className="event-list">
              {frame.events.map((event) => (
                <li key={`${event.runId}-${event.sequence}`}>
                  <span className="event-sequence">{event.sequence}</span>
                  <span>{eventLabel(event)}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {frame.error !== null ? <p className="stream-error">{frame.error}</p> : null}
          {frame.state.error !== null ? <p className="stream-error">{frame.state.error}</p> : null}
        </section>

        <section className="stream-render" aria-labelledby="stream-render-title">
          <div className="panel-heading">
            <h2 id="stream-render-title">Rendered state</h2>
          </div>
          {frame.visibleCards.length === 0 && frame.state.phase !== 'failed' ? (
            <p className="stream-empty">Awaiting validated card data</p>
          ) : null}
          <WorkCardGrid specs={frame.visibleCards} />
        </section>
      </div>
    </section>
  );
}
