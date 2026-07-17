# Low-Priority Supplier Additions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two suppliers to the consolidation heat map whose low savings and medium strategic relationships derive the `Low priority` decision already shown in the legend.

**Architecture:** Extend the trusted supplier fixtures in `lib/demo-data.ts`; do not change thresholds, decision derivation, rendering, or styling. Cover both the authorized context payload and the rendered matrix placement so the dataset and user-visible category remain aligned.

**Tech Stack:** TypeScript, React, Next.js App Router, Vitest, React Testing Library

## Global Constraints

- Keep all existing seven supplier records unchanged.
- Add exactly `Kappel Pack` and `BracketPro Ulm`, for nine suppliers total.
- Both additions must have annual savings below `$250,000`, relationship scores from `50` through `64`, and the derived decision `Low priority`.
- Reuse the existing decision thresholds and matrix band functions without special cases.
- Do not change components, CSS, prompts, or API contracts.

---

### Task 1: Add and verify the low-priority suppliers

**Files:**
- Modify: `lib/context.test.ts`
- Modify: `app/supplier-portfolio-visualization.test.tsx`
- Modify: `lib/demo-data.ts`

**Interfaces:**
- Consumes: `buildAppContext("consolidate", "executive")`, `resolveSupplierPortfolioVisualization(...)`, `deriveSupplierDecision(...)`, `getSavingsBand(...)`, and `getRelationshipBand(...)`.
- Produces: two additional `SupplierPortfolioItem` records named `Kappel Pack` and `BracketPro Ulm` in `workflows.consolidate.heatMap`.

- [x] **Step 1: Write failing data and rendering tests**

Update `lib/context.test.ts` to require nine records and these two fixtures:

```ts
expect(portfolio).toHaveLength(9);
expect(portfolio).toEqual(
  expect.arrayContaining([
    expect.objectContaining({
      supplier: "Kappel Pack",
      annualCostUsd: 900_000,
      annualSavingsUsd: 150_000,
      relationshipScore: 54,
    }),
    expect.objectContaining({
      supplier: "BracketPro Ulm",
      annualCostUsd: 1_100_000,
      annualSavingsUsd: 220_000,
      relationshipScore: 57,
    }),
  ]),
);
```

Update `app/supplier-portfolio-visualization.test.tsx` to require both supplier markers in the `Low savings / Medium relationship` cell and to assert two visible `Low priority` decision chips.

- [x] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm test -- lib/context.test.ts app/supplier-portfolio-visualization.test.tsx
```

Expected: FAIL because the portfolio still has seven suppliers and neither new supplier is rendered.

- [x] **Step 3: Add the minimal supplier fixtures**

Append these objects to `workflows.consolidate.heatMap` in `lib/demo-data.ts`:

```ts
{
  supplier: "Kappel Pack",
  recommendation: "Maintain the current allocation; consolidation savings are limited",
  annualCostUsd: 900_000,
  annualSavingsUsd: 150_000,
  relationshipScore: 58,
  relationshipDrivers: [
    "Stable service on standard packaging formats",
    "Moderate qualification and switching effort",
    "Limited incremental savings from consolidation",
  ],
},
{
  supplier: "BracketPro Ulm",
  recommendation: "Keep under routine review; the consolidation case is limited",
  annualCostUsd: 1_100_000,
  annualSavingsUsd: 220_000,
  relationshipScore: 62,
  relationshipDrivers: [
    "Consistent quality on standard bracket programs",
    "Moderate engineering and transition effort",
    "Limited incremental savings from consolidation",
  ],
},
```

- [x] **Step 4: Run focused and full verification**

Run:

```bash
npm test -- lib/context.test.ts app/supplier-portfolio-visualization.test.tsx
npm test
npm run typecheck
```

Expected: all commands pass with no test failures or TypeScript errors.

- [ ] **Step 5: Commit the change if requested**

```bash
git add lib/context.test.ts app/supplier-portfolio-visualization.test.tsx lib/demo-data.ts docs/superpowers/plans/2026-07-17-low-priority-suppliers.md
git commit -m "Add low-priority suppliers to heat map"
```
