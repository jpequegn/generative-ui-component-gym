# Generative UI Component Gym

A local learning lab for controlled generative UI. A model or orchestration layer may select a
registered tool, but it never generates executable code or arbitrary React. Tool results become
pre-authored, schema-validated work cards: risk changes, metrics, evidence, and approval prompts.

All data is synthetic. The lab needs no model credentials, network service, or external data source.

## What It Demonstrates

```text
typed tool request
  -> deterministic tool result
  -> validated card specification
  -> registered React card
  -> validated human action (when required)
```

The renderer accepts only four component names and their strict Zod schemas. Unknown components,
unsafe links, invalid props, and unregistered actions are rejected before a React component sees
their payload. The evaluator records concise field-level reasons rather than rendering rejected data.

This is controlled UI selection, not arbitrary runtime UI generation. In a production system, an LLM
can choose a registered tool and provide typed arguments; application code still owns tool execution,
authorization, card schemas, component implementations, and action handling.

## Run The Lab

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`.

### Try The Scenarios

1. Select **Run risk review**, then use **Apply next event** four times. The risk, evidence, and
   approval cards arrive one at a time.
2. Enter a decision note and select **Approve** or **Escalate**. The action is validated against the
   active route and resolves the run into a terminal card state.
3. Select **Replay run** to reset the captured event sequence and inspect the same stream again.
4. Select **Run metric snapshot**, then apply its three events to see a completed, non-interrupting
   run.
5. Select **Simulate failed run**, then apply its event to inspect the failure state.
6. Review **Known components only** to see all approved fixture specs accepted and all deliberately
   invalid fixtures rejected at the validation boundary.

## Verification

```sh
npm run check
npx playwright install chromium
npm run test:browser
```

`npm run check` runs formatting, linting, type checking, unit tests, the evaluator, and a production
build. Run the evaluator by itself to print its evidence report:

```sh
npm run evaluate:specs
```

Expected report summary:

```text
Accepted: 4
Rejected: 4
```

## Trust Boundary

The lab deliberately keeps model-facing output small and typed:

- `ToolRequestSchema` allows only `getRiskChange` and `getMetricSnapshot` with identifier inputs.
- `UiCardSpecSchema` allows only the registered work-card component names and data shapes.
- `ApprovalActionRequestSchema` permits only active-route approval or escalation with a substantive
  decision note.
- The stream replay reducer verifies event shape, sequence, and run identity before reconstructing
  state.

It intentionally excludes model-generated HTML, arbitrary JavaScript, dynamic imports, third-party
widgets, production authorization, persistence, real network calls, and real model execution. Those
capabilities require explicit server-side policy, authentication, observability, and further isolation.

## Project Layout

- `src/domain/contracts.ts`: tool, card, evidence, and approval schemas.
- `src/domain/runtime.ts`: deterministic tool execution and replayable event streams.
- `src/domain/approval-actions.ts`: validated human approval and escalation resolver.
- `src/domain/spec-evaluator.ts`: accepted/rejected fixture evaluation and report formatter.
- `src/components/`: pre-authored card renderers, stream console, and boundary evidence panel.
- `scripts/evaluate-specs.ts`: CLI evidence report used by CI.

## Framework Context

See [the framework comparison](docs/framework-comparison.md) for when this controlled tool-to-card
pattern fits relative to Vercel AI SDK, assistant-ui Tool UI and Data UI, LangGraph generative UI,
A2UI catalogs, and MCP Apps.

The adjacent project ideas remain distinct:

- A2UI is a catalog-driven, cross-renderer declarative UI protocol. This lab borrows the controlled
  catalog principle but keeps a local TypeScript union rather than speaking the A2UI protocol.
- MCP Apps are host-rendered, sandboxed app surfaces attached to MCP resources and tools. This lab is
  a standalone local React renderer, not an MCP App or a host integration.
