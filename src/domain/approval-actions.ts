import { z } from 'zod';

import { REGISTERED_ACTIONS } from './contracts';
import type { UiCardSpec } from './contracts';
import type { RunState } from './runtime';

const IdentifierSchema = z.string().regex(/^[a-z][a-z0-9-]{2,79}$/);

export const ApprovalActionRequestSchema = z
  .object({
    requestId: IdentifierSchema,
    routeId: IdentifierSchema,
    action: z.enum(REGISTERED_ACTIONS),
    reason: z.string().trim().min(8).max(280),
    expectedApprovalState: z.literal('pending'),
  })
  .strict();

export type ApprovalActionRequest = z.infer<typeof ApprovalActionRequestSchema>;

export interface ApprovalActionResolution {
  accepted: boolean;
  message: string;
  nextState: RunState;
}

function rejected(nextState: RunState, message: string): ApprovalActionResolution {
  return { accepted: false, message, nextState };
}

export function resolveApprovalAction(
  currentState: RunState,
  value: unknown,
): ApprovalActionResolution {
  const request = ApprovalActionRequestSchema.safeParse(value);

  if (!request.success) {
    return rejected(currentState, 'The decision note or action payload is invalid.');
  }

  if (currentState.phase !== 'awaiting-approval') {
    return rejected(
      currentState,
      'This approval request is stale. Start or replay an active review run.',
    );
  }

  const approvalCard = currentState.cards.find(
    (card): card is Extract<UiCardSpec, { component: 'approval-card' }> =>
      card.component === 'approval-card' && card.data.routeId === request.data.routeId,
  );
  const riskCard = currentState.cards.find(
    (card): card is Extract<UiCardSpec, { component: 'risk-change-card' }> =>
      card.component === 'risk-change-card' && card.data.routeId === request.data.routeId,
  );

  if (approvalCard === undefined || riskCard === undefined) {
    return rejected(currentState, 'The requested route is not active in this review run.');
  }

  if (riskCard.data.approvalState !== request.data.expectedApprovalState) {
    return rejected(
      currentState,
      'The approval state changed before this action could be applied.',
    );
  }

  if (!approvalCard.data.actions.includes(request.data.action)) {
    return rejected(currentState, 'This action is not registered for the active review route.');
  }

  const approvalState = request.data.action === 'approve-risk' ? 'approved' : 'escalated';
  const actionLabel = request.data.action === 'approve-risk' ? 'approved' : 'escalated';
  const nextState: RunState = {
    ...currentState,
    phase: 'completed',
    interruptCardId: null,
    cards: currentState.cards
      .filter(
        (card) => card.component !== 'approval-card' || card.data.routeId !== request.data.routeId,
      )
      .map((card) =>
        card.component === 'risk-change-card' && card.data.routeId === request.data.routeId
          ? { ...card, data: { ...card.data, approvalState } }
          : card,
      ),
  };

  return {
    accepted: true,
    message: `Synthetic route ${actionLabel} with the supplied decision note.`,
    nextState,
  };
}
