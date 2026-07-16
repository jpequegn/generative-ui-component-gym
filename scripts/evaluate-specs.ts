import {
  evaluateFixtureSuite,
  renderEvaluationReport,
  suiteMeetsExpectedBoundary,
} from '../src/domain/spec-evaluator';

const suite = evaluateFixtureSuite();

console.log(renderEvaluationReport(suite));

if (!suiteMeetsExpectedBoundary(suite)) {
  console.error('Expected trusted specifications to pass and invalid specifications to fail.');
  process.exitCode = 1;
}
