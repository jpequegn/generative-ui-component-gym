import { z } from 'zod';

const IdentifierSchema = z.string().regex(/^[a-z][a-z0-9-]{2,79}$/);
const SafeUrlSchema = z
  .string()
  .url()
  .refine(
    (value) => {
      const protocol = new URL(value).protocol;
      return protocol === 'https:' || protocol === 'http:';
    },
    { message: 'URL must use http or https.' },
  );

export const TOOL_NAMES = ['getRiskChange', 'getMetricSnapshot'] as const;
export const CARD_COMPONENTS = [
  'risk-change-card',
  'metric-snapshot-card',
  'evidence-card',
  'approval-card',
] as const;
export const REGISTERED_ACTIONS = ['approve-risk', 'escalate-risk'] as const;

export const RiskLevelSchema = z.enum(['low', 'elevated', 'high']);
export const ApprovalStateSchema = z.enum(['not-required', 'pending', 'approved', 'escalated']);

export const EvidenceSchema = z
  .object({
    id: IdentifierSchema,
    label: z.string().min(3).max(160),
    href: SafeUrlSchema,
    source: z.string().min(2).max(80),
  })
  .strict();

export const RiskChangeSchema = z
  .object({
    routeId: IdentifierSchema,
    routeLabel: z.string().min(3).max(120),
    riskLevel: RiskLevelSchema,
    score: z.number().int().min(0).max(100),
    delta: z.number().int().min(-100).max(100),
    approvalState: ApprovalStateSchema,
    evidence: z.array(EvidenceSchema).min(1).max(5),
  })
  .strict();

export const MetricSnapshotSchema = z
  .object({
    metricId: IdentifierSchema,
    label: z.string().min(3).max(120),
    value: z.number().finite(),
    unit: z.string().min(1).max(16),
    delta: z.number().finite(),
    periodLabel: z.string().min(3).max(80),
    status: z.enum(['on-track', 'watch', 'off-track']),
  })
  .strict();

export const ApprovalPromptSchema = z
  .object({
    routeId: IdentifierSchema,
    title: z.string().min(3).max(120),
    required: z.boolean(),
    actions: z.array(z.enum(REGISTERED_ACTIONS)).min(1).max(2),
  })
  .strict();

export const GetRiskChangeRequestSchema = z
  .object({
    toolName: z.literal('getRiskChange'),
    routeId: IdentifierSchema,
  })
  .strict();

export const GetMetricSnapshotRequestSchema = z
  .object({
    toolName: z.literal('getMetricSnapshot'),
    metricId: IdentifierSchema,
  })
  .strict();

export const ToolRequestSchema = z.discriminatedUnion('toolName', [
  GetRiskChangeRequestSchema,
  GetMetricSnapshotRequestSchema,
]);

export const RiskChangeCardSpecSchema = z
  .object({
    id: IdentifierSchema,
    component: z.literal('risk-change-card'),
    data: RiskChangeSchema,
  })
  .strict();

export const MetricSnapshotCardSpecSchema = z
  .object({
    id: IdentifierSchema,
    component: z.literal('metric-snapshot-card'),
    data: MetricSnapshotSchema,
  })
  .strict();

export const EvidenceCardSpecSchema = z
  .object({
    id: IdentifierSchema,
    component: z.literal('evidence-card'),
    data: z
      .object({ title: z.string().min(3).max(120), evidence: z.array(EvidenceSchema).min(1) })
      .strict(),
  })
  .strict();

export const ApprovalCardSpecSchema = z
  .object({
    id: IdentifierSchema,
    component: z.literal('approval-card'),
    data: ApprovalPromptSchema,
  })
  .strict();

export const UiCardSpecSchema = z.discriminatedUnion('component', [
  RiskChangeCardSpecSchema,
  MetricSnapshotCardSpecSchema,
  EvidenceCardSpecSchema,
  ApprovalCardSpecSchema,
]);

export type ApprovalPrompt = z.infer<typeof ApprovalPromptSchema>;
export type MetricSnapshot = z.infer<typeof MetricSnapshotSchema>;
export type RiskChange = z.infer<typeof RiskChangeSchema>;
export type ToolRequest = z.infer<typeof ToolRequestSchema>;
export type UiCardSpec = z.infer<typeof UiCardSpecSchema>;

export function validateUiCardSpec(value: unknown) {
  return UiCardSpecSchema.safeParse(value);
}
