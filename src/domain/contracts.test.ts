import { describe, expect, it } from 'vitest';

import { ToolRequestSchema, validateUiCardSpec } from './contracts';
import { invalidCardSpecs, validCardSpecs } from './fixtures';

describe('trusted UI contracts', () => {
  it('accepts the approved card catalog fixtures', () => {
    for (const spec of validCardSpecs) {
      expect(validateUiCardSpec(spec).success).toBe(true);
    }
  });

  it.each(Object.entries(invalidCardSpecs))('rejects %s', (_name, spec) => {
    expect(validateUiCardSpec(spec).success).toBe(false);
  });

  it('accepts only known tools with typed identifiers', () => {
    expect(
      ToolRequestSchema.safeParse({ toolName: 'getRiskChange', routeId: 'route-access-review' })
        .success,
    ).toBe(true);
    expect(
      ToolRequestSchema.safeParse({ toolName: 'deleteEverything', routeId: 'route-access-review' })
        .success,
    ).toBe(false);
    expect(
      ToolRequestSchema.safeParse({ toolName: 'getMetricSnapshot', metricId: 'no' }).success,
    ).toBe(false);
  });
});
