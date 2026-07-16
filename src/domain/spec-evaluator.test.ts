import { describe, expect, it } from 'vitest';

import { invalidCardSpecs, validCardSpecs } from './fixtures';
import {
  evaluateFixtureSuite,
  evaluateUiSpecification,
  renderEvaluationReport,
  suiteMeetsExpectedBoundary,
} from './spec-evaluator';

describe('UI specification evaluator', () => {
  it('accepts every approved fixture and rejects every unsafe fixture', () => {
    const suite = evaluateFixtureSuite();

    expect(suite.approved).toHaveLength(validCardSpecs.length);
    expect(suite.rejected).toHaveLength(Object.keys(invalidCardSpecs).length);
    expect(suite.approved.every((result) => result.outcome === 'accepted')).toBe(true);
    expect(suite.rejected.every((result) => result.outcome === 'rejected')).toBe(true);
    expect(suiteMeetsExpectedBoundary(suite)).toBe(true);
  });

  it('records validation reasons without exposing the rejected payload', () => {
    const result = evaluateUiSpecification('unsafeLink', invalidCardSpecs.unsafeLink);

    expect(result).toMatchObject({
      cardId: 'card-unsafe-evidence',
      component: 'evidence-card',
      outcome: 'rejected',
    });
    expect(result.reasons.join(' ')).toMatch(/http or https/i);
    expect(JSON.stringify(result)).not.toContain('javascript:alert');
  });

  it('emits a concise CLI-friendly evidence report', () => {
    const report = renderEvaluationReport(evaluateFixtureSuite());

    expect(report).toContain('Accepted: 4');
    expect(report).toContain('Rejected: 4');
    expect(report).toContain('REJECTED | unsafeLink | evidence-card');
  });
});
