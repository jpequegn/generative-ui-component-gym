import { useId, useState } from 'react';

import type { ApprovalActionRequest } from '../domain/approval-actions';
import { UiCardSpecSchema, type UiCardSpec } from '../domain/contracts';

interface WorkCardGridProps {
  specs: readonly unknown[];
  onApprovalAction?: (request: ApprovalActionRequest) => void;
}

function RiskChangeCard({
  spec,
}: {
  spec: Extract<UiCardSpec, { component: 'risk-change-card' }>;
}) {
  const { data } = spec;
  const delta = `${data.delta > 0 ? '+' : ''}${data.delta}`;

  return (
    <article className="work-card work-card--risk" aria-labelledby={`${spec.id}-title`}>
      <header className="work-card-header">
        <div>
          <p className="work-card-kicker">Risk change</p>
          <h2 id={`${spec.id}-title`}>{data.routeLabel}</h2>
        </div>
        <span className={`risk-chip risk-chip--${data.riskLevel}`}>{data.riskLevel}</span>
      </header>
      <dl className="stat-list">
        <div>
          <dt>Risk score</dt>
          <dd>{data.score}</dd>
        </div>
        <div>
          <dt>Change</dt>
          <dd>{delta}</dd>
        </div>
        <div>
          <dt>Approval</dt>
          <dd>{data.approvalState}</dd>
        </div>
      </dl>
    </article>
  );
}

function MetricSnapshotCard({
  spec,
}: {
  spec: Extract<UiCardSpec, { component: 'metric-snapshot-card' }>;
}) {
  const { data } = spec;
  const delta = `${data.delta > 0 ? '+' : ''}${data.delta}`;
  const deltaClass = data.delta > 0 ? 'metric-delta--positive' : 'metric-delta--negative';

  return (
    <article className="work-card work-card--metric" aria-labelledby={`${spec.id}-title`}>
      <header className="work-card-header">
        <div>
          <p className="work-card-kicker">Metric snapshot</p>
          <h2 id={`${spec.id}-title`}>{data.label}</h2>
        </div>
        <span className="metric-period">{data.periodLabel}</span>
      </header>
      <div className="metric-value-row">
        <p className="metric-value">
          {data.value} <span>{data.unit}</span>
        </p>
        <p className={`metric-delta ${deltaClass}`}>{delta}</p>
      </div>
    </article>
  );
}

function EvidenceCard({ spec }: { spec: Extract<UiCardSpec, { component: 'evidence-card' }> }) {
  return (
    <article className="work-card work-card--evidence" aria-labelledby={`${spec.id}-title`}>
      <header className="work-card-header">
        <div>
          <p className="work-card-kicker">Evidence</p>
          <h2 id={`${spec.id}-title`}>{spec.data.title}</h2>
        </div>
      </header>
      <ul className="evidence-list">
        {spec.data.evidence.map((item) => (
          <li key={item.id}>
            <a href={item.href} rel="noreferrer" target="_blank">
              {item.label}
            </a>
            <span className="evidence-source">{item.source}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ApprovalCard({
  spec,
  onApprovalAction,
}: {
  spec: Extract<UiCardSpec, { component: 'approval-card' }>;
  onApprovalAction?: (request: ApprovalActionRequest) => void;
}) {
  const [reason, setReason] = useState('');
  const reasonId = useId();

  function submit(action: ApprovalActionRequest['action']) {
    onApprovalAction?.({
      requestId: `request-${spec.id}-${action}`,
      routeId: spec.data.routeId,
      action,
      reason,
      expectedApprovalState: 'pending',
    });
  }

  return (
    <article className="work-card work-card--approval" aria-labelledby={`${spec.id}-title`}>
      <header className="work-card-header">
        <div>
          <p className="work-card-kicker">Human review</p>
          <h2 id={`${spec.id}-title`}>{spec.data.title}</h2>
        </div>
      </header>
      <fieldset className="approval-fieldset" disabled={onApprovalAction === undefined}>
        <legend>{spec.data.required ? 'Decision required' : 'Decision optional'}</legend>
        <label className="approval-reason" htmlFor={reasonId}>
          <span>Decision note</span>
          <textarea
            id={reasonId}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Record the evidence used for this decision"
            value={reason}
          />
        </label>
        <div className="approval-actions">
          {spec.data.actions.map((action) => (
            <button
              className={
                action === 'escalate-risk'
                  ? 'action-button action-button--secondary'
                  : 'action-button'
              }
              key={action}
              onClick={() => submit(action)}
              type="button"
            >
              {action === 'approve-risk' ? 'Approve' : 'Escalate'}
            </button>
          ))}
        </div>
      </fieldset>
    </article>
  );
}

function TrustedCard({
  spec,
  onApprovalAction,
}: {
  spec: UiCardSpec;
  onApprovalAction?: (request: ApprovalActionRequest) => void;
}) {
  switch (spec.component) {
    case 'risk-change-card':
      return <RiskChangeCard spec={spec} />;
    case 'metric-snapshot-card':
      return <MetricSnapshotCard spec={spec} />;
    case 'evidence-card':
      return <EvidenceCard spec={spec} />;
    case 'approval-card':
      return <ApprovalCard onApprovalAction={onApprovalAction} spec={spec} />;
  }
}

export function WorkCardGrid({ specs, onApprovalAction }: WorkCardGridProps) {
  const validSpecs = specs.flatMap((value) => {
    const parsed = UiCardSpecSchema.safeParse(value);
    return parsed.success ? [parsed.data] : [];
  });
  const blockedCount = specs.length - validSpecs.length;

  return (
    <section className="card-grid" aria-label="Approved work cards">
      {validSpecs.map((spec) => (
        <TrustedCard key={spec.id} onApprovalAction={onApprovalAction} spec={spec} />
      ))}
      {blockedCount > 0 ? (
        <section className="blocked-card" aria-live="polite">
          <h2>Card blocked</h2>
        </section>
      ) : null}
    </section>
  );
}
