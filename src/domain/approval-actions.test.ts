import { describe, expect, it } from 'vitest';

import { resolveApprovalAction } from './approval-actions';
import { simulateToolRun } from './runtime';
import { streamFrame } from './stream-frame';

function activeReviewState() {
  return streamFrame(
    simulateToolRun({ toolName: 'getRiskChange', routeId: 'route-access-review' }),
    5,
  ).state;
}

function actionRequest(action: 'approve-risk' | 'escalate-risk') {
  return {
    requestId: `request-${action}`,
    routeId: 'route-access-review',
    action,
    reason: 'Synthetic reviewer recorded the required evidence.',
    expectedApprovalState: 'pending' as const,
  };
}

describe('approval action resolver', () => {
  it('approves an active route and removes the stale approval control', () => {
    const result = resolveApprovalAction(activeReviewState(), actionRequest('approve-risk'));

    expect(result).toMatchObject({ accepted: true, nextState: { phase: 'completed' } });
    expect(result.nextState.cards.some((card) => card.component === 'approval-card')).toBe(false);
    expect(
      result.nextState.cards.find((card) => card.component === 'risk-change-card'),
    ).toMatchObject({
      data: { approvalState: 'approved' },
    });
  });

  it('escalates an active route with the same validation boundary', () => {
    const result = resolveApprovalAction(activeReviewState(), actionRequest('escalate-risk'));

    expect(result).toMatchObject({ accepted: true, nextState: { phase: 'completed' } });
    expect(
      result.nextState.cards.find((card) => card.component === 'risk-change-card'),
    ).toMatchObject({
      data: { approvalState: 'escalated' },
    });
  });

  it('rejects malformed and stale action requests without changing state', () => {
    const active = activeReviewState();
    const malformed = resolveApprovalAction(active, {
      ...actionRequest('approve-risk'),
      reason: 'short',
    });
    const stale = resolveApprovalAction(
      { ...active, phase: 'completed' },
      actionRequest('approve-risk'),
    );

    expect(malformed).toMatchObject({ accepted: false, nextState: active });
    expect(stale).toMatchObject({ accepted: false, nextState: { phase: 'completed' } });
  });
});
