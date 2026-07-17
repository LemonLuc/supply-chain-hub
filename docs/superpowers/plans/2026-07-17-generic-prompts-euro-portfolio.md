# Generic Prompts and Euro Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make logistics suggested prompts generic and display every supplier portfolio visualization amount in euros.

**Architecture:** Use workflow demo data as the single source for each persona's suggested prompts. Replace the chart's shared compact-dollar formatter with a compact-euro formatter so matrix, bubble, axis, tooltip, and accessible text all use the same presentation currency.

**Tech Stack:** Next.js, React, TypeScript, Vitest, React Testing Library

## Global Constraints

- Visible logistics suggestions use “this week” and never mention `CW 30`.
- Underlying July 2026 / CW 30 evidence and delivery dates remain unchanged.
- Every portfolio visualization currency label uses EUR/`€`; no dollar symbol or USD axis label remains.
- Internal portfolio payload field names remain unchanged.
- Preserve unrelated dirty visualization and supplier-data edits.

---

### Task 1: Centralize Generic Suggested Prompts

**Files:**
- Modify: `lib/demo-data.ts`
- Modify: `lib/demo-data.test.ts`
- Modify: `app/supply-chain-app.tsx`
- Modify: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Consumes: `workflows.risks.suggestedPrompts`, `workflows.delay.suggestedPrompts`, and `workflows.consolidate.suggestedPrompts`
- Produces: `personaPromptSets` derived from the workflow records

- [ ] **Step 1: Write failing generic-prompt tests**

```ts
expect(workflows.risks.suggestedPrompts).toContain(
  "Show me potential delivery risks for this week.",
);
expect(workflows.risks.suggestedPrompts.join(" ")).not.toContain("CW 30");
```

Update the UI test to click `Show me potential delivery risks for this week` and confirm the chat request still uses `workflowKey: "risks"`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- --run lib/demo-data.test.ts app/supply-chain-app.test.tsx -t "generic suggested prompts|sends the selected role and context"`

Expected: FAIL because the current visible prompt contains `CW 30`.

- [ ] **Step 3: Implement the workflow-backed prompt source**

Change the risk suggestions to:

```ts
"Show me potential delivery risks for this week."
"Create a follow-up plan for delayed freight this week."
```

Replace duplicated UI arrays with:

```ts
const personaPromptSets: Record<PersonaId, string[]> = {
  logistics: workflows.risks.suggestedPrompts,
  procurement: workflows.delay.suggestedPrompts,
  executive: workflows.consolidate.suggestedPrompts,
};
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- --run lib/demo-data.test.ts app/supply-chain-app.test.tsx`

Expected: PASS.

### Task 2: Render Portfolio Currency in Euros

**Files:**
- Modify: `lib/supplier-portfolio-chart.ts`
- Modify: `lib/supplier-portfolio-chart.test.ts`
- Modify: `app/supplier-portfolio-visualization.tsx`
- Modify: `app/supplier-portfolio-visualization.test.tsx`

**Interfaces:**
- Produces: `formatCompactEur(value: number): string`
- Consumes: existing numeric `annualCostUsd` and `annualSavingsUsd` values for presentation only

- [ ] **Step 1: Write failing euro-format tests**

```ts
expect(formatCompactEur(0)).toBe("€0");
expect(formatCompactEur(120_000)).toBe("€120K");
expect(formatCompactEur(2_100_000)).toBe("€2.1M");
expect(formatCompactEur(-4_600_000)).toBe("-€4.6M");
```

Update visualization expectations to require `Annual consolidation savings (EUR)`, `€4.6M`, `€800K`, and matrix savings such as `€520K`, while rejecting `$` and the USD axis label.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- --run lib/supplier-portfolio-chart.test.ts app/supplier-portfolio-visualization.test.tsx`

Expected: FAIL because `formatCompactEur` and EUR rendering do not exist.

- [ ] **Step 3: Implement the shared euro formatter**

Rename `formatCompactUsd` to `formatCompactEur` and emit `€` after an optional negative sign. Import the renamed helper in the visualization component, use it for matrix values, axis ticks, bubble costs, and SVG titles, and change the x-axis suffix to `(EUR)`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- --run lib/supplier-portfolio-chart.test.ts app/supplier-portfolio-visualization.test.tsx`

Expected: PASS.

- [ ] **Step 5: Stage only scoped hunks and commit**

```bash
git add lib/demo-data.test.ts app/supply-chain-app.test.tsx app/supply-chain-app.tsx
git add -p lib/demo-data.ts lib/supplier-portfolio-chart.ts lib/supplier-portfolio-chart.test.ts app/supplier-portfolio-visualization.tsx app/supplier-portfolio-visualization.test.tsx
git commit -m "Use generic prompts and euro portfolio values"
```

### Task 3: Full Verification

**Files:**
- Verify only

- [ ] **Step 1: Audit visible copy**

Run: `rg -n "CW 30|formatCompactUsd|\\$[0-9]|\\(USD\\)" app lib`

Expected: `CW 30` remains only in underlying workflow evidence/questions/tests, not suggested-prompt arrays; no dollar visualization formatter or USD axis label remains.

- [ ] **Step 2: Run complete verification**

```bash
npm test
npm run typecheck
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 3: Confirm the dev server**

Run: `curl --fail --silent --show-error --head http://127.0.0.1:3000/`

Expected: HTTP 200.
