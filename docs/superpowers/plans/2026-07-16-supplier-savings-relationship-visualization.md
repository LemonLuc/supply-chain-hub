# Supplier Savings–Relationship Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace cost/resilience portfolio visuals with an LLM-selected savings/strategic-relationship matrix or modern bubble chart using server-derived decision heat colors and seven realistic demo suppliers.

**Architecture:** Keep the LLM responsible only for selecting `matrix` or `bubble`; supplier facts and decision derivation stay in trusted server data. Put portfolio validation and decision thresholds in `lib/supplier-portfolio.ts`, pure SVG geometry and currency formatting in a focused `lib/supplier-portfolio-chart.ts`, and rendering in `app/supplier-portfolio-visualization.tsx`.

**Tech Stack:** Next.js App Router, React, strict TypeScript, Vercel AI SDK, inline SVG, Vitest, React Testing Library, CSS custom properties.

## Global Constraints

- Bubble x-axis copy is exactly `Annual consolidation savings · USD`.
- Bubble y-axis copy is exactly `Strategic relationship score` and spans 0–100.
- High savings begins at `$350,000`; high relationship begins at `65`.
- Decision colors mean reddish `Keep`, green `Consolidate`, amber/orange `Strategic trade-off`, and slate `Low priority`.
- Plot and matrix cell backgrounds remain neutral; only bubbles and supplier markers use decision colors.
- Bubble radius is derived from annual cost using square-root normalization into 18–46 SVG pixels.
- Company names are centered above bubbles with a 16 SVG-pixel edge gap.
- Bubbles contain only formatted annual cost, never the text `Annual cost`.
- Bubble view omits the source-note subtitle, action legend, and model reason.
- No new runtime dependency is added.

---

### Task 1: Replace the supplier portfolio contract and derive decision heat zones

**Files:**
- Modify: `lib/supplier-portfolio.ts`
- Modify: `lib/supplier-portfolio.test.ts`

**Interfaces:**
- Produces: `SupplierPortfolioDecision`, `deriveSupplierDecision(item)`, `getSavingsBand(value)`, `getRelationshipBand(value)`, and the revised `SupplierPortfolioItem` numeric fields.
- Consumes: Existing `SupplierPortfolioView`, resolver, parser, and deterministic view-selection behavior.

- [ ] **Step 1: Write failing contract and threshold tests**

Add fixtures using `annualCostUsd`, `annualSavingsUsd`, and `relationshipScore`, then assert all four quadrants and threshold boundaries:

```ts
expect(deriveSupplierDecision(item({ annualSavingsUsd: 349_999, relationshipScore: 65 }))).toBe("Keep");
expect(deriveSupplierDecision(item({ annualSavingsUsd: 350_000, relationshipScore: 64 }))).toBe("Consolidate");
expect(deriveSupplierDecision(item({ annualSavingsUsd: 350_000, relationshipScore: 65 }))).toBe("Strategic trade-off");
expect(deriveSupplierDecision(item({ annualSavingsUsd: 100_000, relationshipScore: 30 }))).toBe("Low priority");
expect(canRenderBubble([item({ relationshipScore: 101 })])).toBe(false);
```

- [ ] **Step 2: Run the focused test and verify the old contract fails**

Run: `npm test -- lib/supplier-portfolio.test.ts`

Expected: FAIL because the new fields and `deriveSupplierDecision` do not exist.

- [ ] **Step 3: Implement the revised trusted data contract**

Replace cost/resilience/action fields with:

```ts
export const supplierPortfolioDecisions = [
  "Keep",
  "Consolidate",
  "Strategic trade-off",
  "Low priority",
] as const;

export type SupplierPortfolioDecision = (typeof supplierPortfolioDecisions)[number];

export type SupplierPortfolioItem = {
  supplier: string;
  recommendation: string;
  targetSupplier?: string;
  annualCostUsd: number;
  annualSavingsUsd: number;
  relationshipScore: number;
  relationshipDrivers?: string[];
};

export type ResolvedSupplierPortfolioItem = SupplierPortfolioItem & {
  decision: SupplierPortfolioDecision;
};

export function deriveSupplierDecision(item: SupplierPortfolioItem): SupplierPortfolioDecision {
  const highSavings = item.annualSavingsUsd >= 350_000;
  const highRelationship = item.relationshipScore >= 65;
  if (highSavings && highRelationship) return "Strategic trade-off";
  if (highSavings) return "Consolidate";
  if (highRelationship) return "Keep";
  return "Low priority";
}
```

Validate finite non-negative currency values, relationship scores from 0–100, non-empty drivers, and decision consistency in parsed output. Derive matrix bands with low/medium/high thresholds from the specification.

- [ ] **Step 4: Run the focused test and typecheck**

Run: `npm test -- lib/supplier-portfolio.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: FAIL only in consumers that still use legacy portfolio fields, proving the migration boundary.

- [ ] **Step 5: Commit the contract**

```bash
git add lib/supplier-portfolio.ts lib/supplier-portfolio.test.ts
git commit -m "Replace portfolio metrics with savings and relationship"
```

---

### Task 2: Add seven realistic suppliers and align model instructions

**Files:**
- Modify: `lib/demo-data.ts`
- Modify: `lib/context.test.ts`
- Modify: `lib/chat.ts`
- Modify: `lib/chat.test.ts`
- Modify: `lib/chat-extensions.ts`
- Modify: `app/api/chat/route.test.ts`
- Modify: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Consumes: Revised `SupplierPortfolioItem` and resolver from Task 1.
- Produces: Seven authorized supplier records and savings/relationship-aware model instructions.

- [ ] **Step 1: Write failing demo-data and prompt assertions**

Assert the portfolio contains seven suppliers, including the two new names, and that numeric values match the approved dataset:

```ts
expect(portfolio).toHaveLength(7);
expect(portfolio).toEqual(expect.arrayContaining([
  expect.objectContaining({ supplier: "FlexPack Esslingen", annualCostUsd: 800_000, annualSavingsUsd: 660_000, relationshipScore: 35 }),
  expect.objectContaining({ supplier: "HelioGlass Dresden", annualCostUsd: 2_300_000, annualSavingsUsd: 910_000, relationshipScore: 70 }),
]));
expect(portfolioPrompt).toContain("annual consolidation savings");
expect(portfolioPrompt).toContain("strategic relationship");
expect(portfolioPrompt).toContain("Strategic trade-off");
```

- [ ] **Step 2: Run affected tests and verify legacy fixtures fail**

Run: `npm test -- lib/context.test.ts lib/chat.test.ts app/api/chat/route.test.ts app/supply-chain-app.test.tsx`

Expected: FAIL on legacy field names, supplier count, and prompt copy.

- [ ] **Step 3: Replace the demo portfolio records**

Use the exact annual cost, savings, and relationship values from the approved specification. Add concise relationship drivers, for example:

```ts
{
  supplier: "MediSeal Jena",
  recommendation: "Keep as the strategic sterile-packaging anchor",
  annualCostUsd: 2_100_000,
  annualSavingsUsd: 120_000,
  relationshipScore: 93,
  relationshipDrivers: ["98% delivery reliability", "validated sterile process", "low switching risk"],
}
```

Update test-side mock suppliers to the same contract.

- [ ] **Step 4: Update model and tool instructions**

Change bubble-selection wording to require complete annual savings, annual cost, and relationship measures. Instruct the written answer to use `Keep`, `Consolidate`, `Strategic trade-off`, and `Low priority`, and to explain the factors captured by relationship score. Keep the tool schema limited to `preferredView` and `reason`.

- [ ] **Step 5: Run affected tests and typecheck**

Run: `npm test -- lib/context.test.ts lib/chat.test.ts app/api/chat/route.test.ts app/supply-chain-app.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: remaining failures are limited to the legacy visualization renderer until Task 4.

- [ ] **Step 6: Commit the trusted data and prompt migration**

```bash
git add lib/demo-data.ts lib/context.test.ts lib/chat.ts lib/chat.test.ts lib/chat-extensions.ts app/api/chat/route.test.ts app/supply-chain-app.test.tsx
git commit -m "Add supplier savings and relationship decision data"
```

---

### Task 3: Build pure bubble geometry and currency helpers

**Files:**
- Create: `lib/supplier-portfolio-chart.ts`
- Create: `lib/supplier-portfolio-chart.test.ts`

**Interfaces:**
- Consumes: `ResolvedSupplierPortfolioItem` from Task 1.
- Produces: `formatCompactUsd(value)`, `getSavingsAxisMaximum(suppliers)`, and `buildBubbleChartLayout(suppliers, bounds)`.

- [ ] **Step 1: Write failing formatting, scale, gap, and overlap tests**

Use the real seven-supplier demo array and assert:

```ts
expect(formatCompactUsd(120_000)).toBe("$120K");
expect(formatCompactUsd(2_100_000)).toBe("$2.1M");
expect(getSavingsAxisMaximum(suppliers)).toBe(1_000_000);
expect(Math.min(...layout.map((item) => item.radius))).toBe(18);
expect(Math.max(...layout.map((item) => item.radius))).toBe(46);
expect(layout.every((item) => item.labelY === Math.max(20, item.y - item.radius - 16))).toBe(true);
```

For every pair, assert Euclidean center distance is at least the sum of radii plus 6 pixels.

- [ ] **Step 2: Run the new test and verify missing-module failure**

Run: `npm test -- lib/supplier-portfolio-chart.test.ts`

Expected: FAIL because the helper module does not exist.

- [ ] **Step 3: Implement pure chart helpers**

Use a nice axis maximum rounded up to `$250K` increments. Calculate x from savings/max, y from `100 - relationshipScore`, and radius with normalized square roots of annual cost:

```ts
const normalized = (Math.sqrt(cost) - Math.sqrt(minCost)) /
  (Math.sqrt(maxCost) - Math.sqrt(minCost));
const radius = 18 + normalized * 28;
```

Return immutable layout records with supplier, x, y, radius, and labelY.

- [ ] **Step 4: Run helper tests and typecheck**

Run: `npm test -- lib/supplier-portfolio-chart.test.ts`

Expected: PASS with no pairwise overlap.

Run: `npm run typecheck`

Expected: only renderer migration failures remain.

- [ ] **Step 5: Commit chart geometry**

```bash
git add lib/supplier-portfolio-chart.ts lib/supplier-portfolio-chart.test.ts
git commit -m "Add supplier bubble chart geometry"
```

---

### Task 4: Render the approved modern bubble map and aligned matrix

**Files:**
- Modify: `app/supplier-portfolio-visualization.tsx`
- Modify: `app/supplier-portfolio-visualization.test.tsx`

**Interfaces:**
- Consumes: decision/band helpers from Task 1 and geometry helpers from Task 3.
- Produces: accessible savings/relationship matrix and bubble-map React UI.

- [ ] **Step 1: Replace renderer tests with approved UI assertions**

Assert the bubble has the new accessible name and axes, seven supplier names, formatted annual cost inside each bubble, decisions on accessible titles, and none of the removed metadata:

```ts
expect(screen.getByRole("img", { name: /supplier savings and strategic relationship map/i })).toBeInTheDocument();
expect(screen.getByText("Annual consolidation savings · USD")).toBeInTheDocument();
expect(screen.getByText("Strategic relationship score")).toBeInTheDocument();
expect(screen.getByText("$4.6M")).toBeInTheDocument();
expect(screen.queryByText(/Quantitative view/i)).not.toBeInTheDocument();
expect(screen.queryByRole("list", { name: /decision action legend/i })).not.toBeInTheDocument();
expect(screen.queryByText(visualization.reason)).not.toBeInTheDocument();
```

For matrix view, assert `Relationship / savings`, neutral cells, derived decision labels, and the decision legend.

- [ ] **Step 2: Run the renderer test and verify old copy fails**

Run: `npm test -- app/supplier-portfolio-visualization.test.tsx`

Expected: FAIL on old cost/resilience axes and metadata.

- [ ] **Step 3: Implement the matrix migration**

Group suppliers with `getSavingsBand` and `getRelationshipBand`. Rename headers and title. Remove zone background classes and apply `decision-*` only to supplier markers and their visible decision chips.

- [ ] **Step 4: Implement the modern bubble map**

Use `buildBubbleChartLayout`, currency ticks, neutral SVG background, restrained drop shadow, company names at `labelY`, and only the annual cost at the bubble center. Apply `decision-keep`, `decision-consolidate`, `decision-strategic-trade-off`, or `decision-low-priority` to each bubble.

For bubble view, render only the eyebrow, title, chart, and relationship-factor note. Preserve the matrix legend only in matrix view.

- [ ] **Step 5: Run renderer tests and typecheck**

Run: `npm test -- app/supplier-portfolio-visualization.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit the renderers**

```bash
git add app/supplier-portfolio-visualization.tsx app/supplier-portfolio-visualization.test.tsx
git commit -m "Render supplier savings relationship views"
```

---

### Task 5: Apply the shared decision color system and responsive polish

**Files:**
- Modify: `app/globals.css`
- Modify: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Consumes: Renderer class names from Task 4.
- Produces: light/dark semantic decision tokens and neutral responsive chart styling.

- [ ] **Step 1: Write failing semantic-style contract assertions**

Require light and dark definitions for:

```ts
const requiredTokens = [
  "--decision-keep",
  "--decision-consolidate",
  "--decision-tradeoff",
  "--decision-low-priority",
];
```

Also assert the chart-zone fill selectors are absent and the results grid retains `minmax(0, 1fr)` containment.

- [ ] **Step 2: Run the style contract test and verify failure**

Run: `npm test -- app/supply-chain-app.test.tsx -t "defines semantic"`

Expected: FAIL because the new decision tokens do not exist.

- [ ] **Step 3: Implement the approved visual system**

Define light tokens close to reddish `#db5b66`, green `#20a36a`, amber `#e7a43c`, and slate `#7b8798`, plus accessible dark-mode variants. Remove colored plot-zone fills. Style neutral grid lines, modern bubble shadows, decision-colored circles/markers, centered dollar labels, and supplier-name typography with the approved gap supplied by geometry.

Keep matrix backgrounds neutral and preserve internal horizontal scrolling at the 640-pixel breakpoint.

- [ ] **Step 4: Run application tests and typecheck**

Run: `npm test -- app/supply-chain-app.test.tsx app/supplier-portfolio-visualization.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit the shared heat colors**

```bash
git add app/globals.css app/supply-chain-app.test.tsx
git commit -m "Align supplier decision heat colors"
```

---

### Task 6: Verify the complete adaptive workflow

**Files:**
- Verify only; modify tests or implementation only for defects found during this task.

**Interfaces:**
- Consumes: All previous tasks.
- Produces: Release evidence for automated, production-build, and visual behavior.

- [ ] **Step 1: Run the full automated suite**

Run: `npm test`

Expected: all test files and tests pass with zero failures.

- [ ] **Step 2: Run strict TypeScript and production build**

Run: `npm run typecheck`

Expected: exit 0 with no diagnostics.

Run: `npm run build`

Expected: optimized Next.js build completes and lists `/`, `/api/actions`, and `/api/chat`.

- [ ] **Step 3: Verify both model-selected views in the browser**

Start `npm run dev`. As Chief Logistics Officer, run a categorical supplier prompt and a quantitative savings/relationship prompt. Verify matrix and bubble selection, seven suppliers, no old metadata, no bubble overlap, neutral backgrounds, exact currency/axis copy, and matching heat colors.

- [ ] **Step 4: Verify themes and mobile containment**

Check light and dark themes at desktop width, then set a 390×844 viewport. Confirm `document.documentElement.scrollWidth === window.innerWidth` while the chart wrapper has `scrollWidth > clientWidth` on mobile. Confirm the browser console contains no errors or warnings.

- [ ] **Step 5: Review final scope and repository state**

Run: `git diff --check`

Expected: no output.

Run: `git status --short --branch`

Expected: only intentionally preserved unrelated user files, if any; no uncommitted feature files.
