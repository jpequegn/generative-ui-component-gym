import { UiCardSpecSchema } from './contracts';
import { invalidCardSpecs, validCardSpecs } from './fixtures';

export interface SpecificationEvaluation {
  caseName: string;
  cardId: string | null;
  component: string | null;
  outcome: 'accepted' | 'rejected';
  reasons: string[];
}

export interface EvaluationSuite {
  approved: SpecificationEvaluation[];
  rejected: SpecificationEvaluation[];
}

function stringField(value: unknown, field: string): string | null {
  if (typeof value !== 'object' || value === null || !(field in value)) {
    return null;
  }

  const candidate = value[field as keyof typeof value];
  return typeof candidate === 'string' ? candidate : null;
}

function issueReason(path: PropertyKey[], message: string): string {
  const location = path.length === 0 ? 'specification' : path.map(String).join('.');
  return `${location}: ${message}`;
}

export function evaluateUiSpecification(caseName: string, value: unknown): SpecificationEvaluation {
  const parsed = UiCardSpecSchema.safeParse(value);

  if (parsed.success) {
    return {
      caseName,
      cardId: parsed.data.id,
      component: parsed.data.component,
      outcome: 'accepted',
      reasons: [],
    };
  }

  return {
    caseName,
    cardId: stringField(value, 'id'),
    component: stringField(value, 'component'),
    outcome: 'rejected',
    reasons: parsed.error.issues.map((issue) => issueReason(issue.path, issue.message)),
  };
}

export function evaluateFixtureSuite(): EvaluationSuite {
  return {
    approved: validCardSpecs.map((spec) => evaluateUiSpecification(spec.id, spec)),
    rejected: Object.entries(invalidCardSpecs).map(([caseName, spec]) =>
      evaluateUiSpecification(caseName, spec),
    ),
  };
}

export function suiteMeetsExpectedBoundary(suite: EvaluationSuite): boolean {
  return (
    suite.approved.length > 0 &&
    suite.rejected.length > 0 &&
    suite.approved.every((result) => result.outcome === 'accepted') &&
    suite.rejected.every((result) => result.outcome === 'rejected')
  );
}

export function renderEvaluationReport(suite: EvaluationSuite): string {
  const approved = suite.approved.map(
    (result) => `ACCEPTED | ${result.caseName} | ${result.component ?? 'unknown'}`,
  );
  const rejected = suite.rejected.map(
    (result) =>
      `REJECTED | ${result.caseName} | ${result.component ?? 'unknown'} | ${result.reasons.join('; ')}`,
  );

  return [
    'UI specification evaluation',
    `Accepted: ${suite.approved.length}`,
    `Rejected: ${suite.rejected.length}`,
    ...approved,
    ...rejected,
  ].join('\n');
}
