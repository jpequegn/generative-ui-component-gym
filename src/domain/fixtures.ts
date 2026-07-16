import type { MetricSnapshot, RiskChange, UiCardSpec } from './contracts';

export const riskChangeFixture: RiskChange = {
  routeId: 'route-access-review',
  routeLabel: 'Review privileged access change',
  riskLevel: 'high',
  score: 82,
  delta: 24,
  approvalState: 'pending',
  evidence: [
    {
      id: 'evidence-access-diff',
      label: 'The synthetic change expands access for a production role.',
      href: 'https://evidence.example.test/access/diff',
      source: 'Policy diff',
    },
    {
      id: 'evidence-control',
      label: 'The route policy requires a human approval gate.',
      href: 'https://evidence.example.test/access/policy',
      source: 'Control policy',
    },
  ],
};

export const metricSnapshotFixture: MetricSnapshot = {
  metricId: 'metric-approval-latency',
  label: 'Median approval latency',
  value: 18.4,
  unit: 'hours',
  delta: -3.1,
  periodLabel: 'Previous 30 days',
  status: 'on-track',
};

export const validCardSpecs: UiCardSpec[] = [
  {
    id: 'card-risk-access-review',
    component: 'risk-change-card',
    data: riskChangeFixture,
  },
  {
    id: 'card-metric-approval-latency',
    component: 'metric-snapshot-card',
    data: metricSnapshotFixture,
  },
  {
    id: 'card-evidence-access-review',
    component: 'evidence-card',
    data: { title: 'Review evidence', evidence: riskChangeFixture.evidence },
  },
  {
    id: 'card-approval-access-review',
    component: 'approval-card',
    data: {
      routeId: riskChangeFixture.routeId,
      title: 'Approve privileged access change',
      required: true,
      actions: ['approve-risk', 'escalate-risk'],
    },
  },
];

export const invalidCardSpecs = {
  invalidProperty: {
    id: 'card-invalid-metric',
    component: 'metric-snapshot-card',
    data: { ...metricSnapshotFixture, value: 'fast' },
  },
  unknownComponent: {
    id: 'card-runtime-html',
    component: 'runtime-html',
    data: { html: '<button>Run this</button>' },
  },
  unsafeLink: {
    id: 'card-unsafe-evidence',
    component: 'evidence-card',
    data: {
      title: 'Unsafe evidence',
      evidence: [
        {
          id: 'evidence-unsafe-link',
          label: 'Do not render this link.',
          href: 'javascript:alert(1)',
          source: 'Untrusted source',
        },
      ],
    },
  },
  unregisteredAction: {
    id: 'card-unregistered-action',
    component: 'approval-card',
    data: {
      routeId: riskChangeFixture.routeId,
      title: 'Invalid action',
      required: true,
      actions: ['delete-production'],
    },
  },
} as const;
