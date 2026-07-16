import type { UiCardSpec } from './contracts';
import { initialRunState, replayRunEvents, type RunEvent, type RunState } from './runtime';

export interface StreamFrame {
  state: RunState;
  events: RunEvent[];
  visibleCards: UiCardSpec[];
  error: string | null;
}

export function visibleCardsFor(state: RunState): UiCardSpec[] {
  return state.cards.filter(
    (card) => card.component !== 'approval-card' || state.phase === 'awaiting-approval',
  );
}

export function streamFrame(events: readonly RunEvent[], eventCount: number): StreamFrame {
  const visibleEvents = events.slice(0, Math.max(0, eventCount));

  if (visibleEvents.length === 0) {
    return { state: initialRunState, events: [], visibleCards: [], error: null };
  }

  const replay = replayRunEvents(visibleEvents);

  if (!replay.ok) {
    return {
      state: initialRunState,
      events: visibleEvents,
      visibleCards: [],
      error: replay.message,
    };
  }

  return {
    state: replay.state,
    events: visibleEvents,
    visibleCards: visibleCardsFor(replay.state),
    error: null,
  };
}
