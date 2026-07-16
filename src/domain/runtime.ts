import { z } from 'zod';

import {
  ApprovalPromptSchema,
  MetricSnapshotCardSpecSchema,
  MetricSnapshotSchema,
  RiskChangeCardSpecSchema,
  RiskChangeSchema,
  ToolRequestSchema,
  UiCardSpecSchema,
  type ToolRequest,
  type UiCardSpec,
} from './contracts';
import { metricSnapshotFixture, riskChangeFixture } from './fixtures';

const RunIdSchema = z.string().regex(/^run-[a-z0-9-]{3,100}$/);
const SequenceSchema = z.number().int().min(1);

const RunStartedEventSchema = z
  .object({
    type: z.literal('run-started'),
    runId: RunIdSchema,
    sequence: SequenceSchema,
    request: ToolRequestSchema,
  })
  .strict();

const CardUpsertedEventSchema = z
  .object({
    type: z.literal('card-upserted'),
    runId: RunIdSchema,
    sequence: SequenceSchema,
    card: UiCardSpecSchema,
  })
  .strict();

const ApprovalInterruptedEventSchema = z
  .object({
    type: z.literal('approval-interrupted'),
    runId: RunIdSchema,
    sequence: SequenceSchema,
    cardId: z.string().regex(/^[a-z][a-z0-9-]{2,79}$/),
  })
  .strict();

const RunCompletedEventSchema = z
  .object({
    type: z.literal('run-completed'),
    runId: RunIdSchema,
    sequence: SequenceSchema,
  })
  .strict();

const RunFailedEventSchema = z
  .object({
    type: z.literal('run-failed'),
    runId: RunIdSchema,
    sequence: SequenceSchema,
    message: z.string().min(3).max(240),
  })
  .strict();

export const RunEventSchema = z.discriminatedUnion('type', [
  RunStartedEventSchema,
  CardUpsertedEventSchema,
  ApprovalInterruptedEventSchema,
  RunCompletedEventSchema,
  RunFailedEventSchema,
]);

export type RunEvent = z.infer<typeof RunEventSchema>;

export type ToolExecution =
  | {
      ok: true;
      request: ToolRequest;
      cards: UiCardSpec[];
    }
  | {
      ok: false;
      code: 'invalid-request' | 'not-found';
      message: string;
    };

export interface RunState {
  runId: string | null;
  phase: 'idle' | 'running' | 'awaiting-approval' | 'completed' | 'failed';
  cards: UiCardSpec[];
  interruptCardId: string | null;
  error: string | null;
}

export const initialRunState: RunState = {
  runId: null,
  phase: 'idle',
  cards: [],
  interruptCardId: null,
  error: null,
};

function riskCards(data: z.infer<typeof RiskChangeSchema>): UiCardSpec[] {
  const approvalLabel = data.routeLabel.replace(/^review\s+/i, '').toLowerCase();
  const approval = ApprovalPromptSchema.parse({
    routeId: data.routeId,
    title: `Approve ${approvalLabel}`,
    required: data.approvalState === 'pending',
    actions: ['approve-risk', 'escalate-risk'],
  });

  return [
    RiskChangeCardSpecSchema.parse({
      id: `card-risk-${data.routeId}`,
      component: 'risk-change-card',
      data,
    }),
    {
      id: `card-evidence-${data.routeId}`,
      component: 'evidence-card',
      data: { title: 'Decision evidence', evidence: data.evidence },
    },
    {
      id: `card-approval-${data.routeId}`,
      component: 'approval-card',
      data: approval,
    },
  ];
}

function metricCards(data: z.infer<typeof MetricSnapshotSchema>): UiCardSpec[] {
  return [
    MetricSnapshotCardSpecSchema.parse({
      id: `card-metric-${data.metricId}`,
      component: 'metric-snapshot-card',
      data,
    }),
  ];
}

export function executeToolRequest(value: unknown): ToolExecution {
  const request = ToolRequestSchema.safeParse(value);

  if (!request.success) {
    return {
      ok: false,
      code: 'invalid-request',
      message: 'The selected tool or its arguments are not registered.',
    };
  }

  if (request.data.toolName === 'getRiskChange') {
    if (request.data.routeId !== riskChangeFixture.routeId) {
      return {
        ok: false,
        code: 'not-found',
        message: 'No synthetic risk route matches the supplied route ID.',
      };
    }

    return { ok: true, request: request.data, cards: riskCards(riskChangeFixture) };
  }

  if (request.data.metricId !== metricSnapshotFixture.metricId) {
    return {
      ok: false,
      code: 'not-found',
      message: 'No synthetic metric matches the supplied metric ID.',
    };
  }

  return { ok: true, request: request.data, cards: metricCards(metricSnapshotFixture) };
}

function runIdFor(request: ToolRequest): string {
  return `run-${request.toolName.toLowerCase()}-${
    request.toolName === 'getRiskChange' ? request.routeId : request.metricId
  }`;
}

export function simulateToolRun(value: unknown): RunEvent[] {
  const execution = executeToolRequest(value);

  if (!execution.ok) {
    return [
      RunFailedEventSchema.parse({
        type: 'run-failed',
        runId: 'run-invalid-request',
        sequence: 1,
        message: execution.message,
      }),
    ];
  }

  const runId = runIdFor(execution.request);
  const events: RunEvent[] = [
    RunStartedEventSchema.parse({
      type: 'run-started',
      runId,
      sequence: 1,
      request: execution.request,
    }),
    ...execution.cards.map((card, index) =>
      CardUpsertedEventSchema.parse({
        type: 'card-upserted',
        runId,
        sequence: index + 2,
        card,
      }),
    ),
  ];
  const approvalCard = execution.cards.find(
    (card): card is z.infer<typeof UiCardSpecSchema> & { component: 'approval-card' } =>
      card.component === 'approval-card' && card.data.required,
  );

  if (approvalCard !== undefined) {
    events.push(
      ApprovalInterruptedEventSchema.parse({
        type: 'approval-interrupted',
        runId,
        sequence: events.length + 1,
        cardId: approvalCard.id,
      }),
    );
    return events;
  }

  events.push(
    RunCompletedEventSchema.parse({ type: 'run-completed', runId, sequence: events.length + 1 }),
  );
  return events;
}

function replaceCard(cards: UiCardSpec[], card: UiCardSpec): UiCardSpec[] {
  const index = cards.findIndex((current) => current.id === card.id);

  if (index === -1) {
    return [...cards, card];
  }

  return cards.map((current) => (current.id === card.id ? card : current));
}

export function applyRunEvent(state: RunState, event: RunEvent): RunState {
  switch (event.type) {
    case 'run-started':
      return { ...initialRunState, runId: event.runId, phase: 'running' };
    case 'card-upserted':
      return { ...state, cards: replaceCard(state.cards, event.card) };
    case 'approval-interrupted':
      return { ...state, phase: 'awaiting-approval', interruptCardId: event.cardId };
    case 'run-completed':
      return { ...state, phase: 'completed' };
    case 'run-failed':
      return { ...initialRunState, runId: event.runId, phase: 'failed', error: event.message };
  }
}

export function replayRunEvents(
  values: readonly unknown[],
): { ok: true; state: RunState } | { ok: false; message: string } {
  let state = initialRunState;
  let expectedSequence = 1;
  let expectedRunId: string | null = null;

  for (const value of values) {
    const parsed = RunEventSchema.safeParse(value);

    if (!parsed.success) {
      return { ok: false, message: 'The stream contains an invalid event.' };
    }

    if (parsed.data.sequence !== expectedSequence) {
      return { ok: false, message: 'The stream sequence is incomplete or out of order.' };
    }

    if (expectedRunId !== null && parsed.data.runId !== expectedRunId) {
      return { ok: false, message: 'The stream mixes events from different runs.' };
    }

    expectedRunId = parsed.data.runId;
    state = applyRunEvent(state, parsed.data);
    expectedSequence += 1;
  }

  return { ok: true, state };
}
