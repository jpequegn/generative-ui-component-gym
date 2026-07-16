import { useMemo } from 'react';

import {
  evaluateFixtureSuite,
  suiteMeetsExpectedBoundary,
  type SpecificationEvaluation,
} from '../domain/spec-evaluator';

interface EvidenceRowProps {
  result: SpecificationEvaluation;
}

function EvidenceRow({ result }: EvidenceRowProps) {
  return (
    <li className={`evidence-row evidence-row-${result.outcome}`}>
      <span className="evidence-outcome">{result.outcome}</span>
      <span>{result.caseName}</span>
      <span className="evidence-component">{result.component ?? 'unknown component'}</span>
      {result.reasons.length > 0 ? <span>{result.reasons.join('; ')}</span> : null}
    </li>
  );
}

export function SpecificationEvidence() {
  const suite = useMemo(() => evaluateFixtureSuite(), []);
  const boundaryHolds = suiteMeetsExpectedBoundary(suite);

  return (
    <section className="specification-evidence" aria-labelledby="specification-evidence-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Contract evidence</p>
          <h2 id="specification-evidence-heading">Known components only</h2>
        </div>
        <span className={boundaryHolds ? 'verification-pass' : 'verification-fail'}>
          {boundaryHolds ? 'Boundary holds' : 'Boundary failed'}
        </span>
      </div>
      <p className="specification-summary">
        {suite.approved.length} approved specifications are eligible for rendering.{' '}
        {suite.rejected.length} invalid specifications are stopped at the schema boundary.
      </p>
      <ul className="evidence-list" aria-label="Specification evaluation results">
        {suite.approved.map((result) => (
          <EvidenceRow key={result.caseName} result={result} />
        ))}
        {suite.rejected.map((result) => (
          <EvidenceRow key={result.caseName} result={result} />
        ))}
      </ul>
    </section>
  );
}
