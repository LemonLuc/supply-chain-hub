# Decision-support Color Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Distinguish Protected findings from consolidation recommendations, modernize bubble fills with black fitted values, and add the shared decision legend to the bubble map.

**Architecture:** Reuse the existing `DecisionLegend` component for matrix and bubble views. Keep semantic decision tokens for text and borders, add separate light fill tokens for bubbles and legend swatches, and give Protected findings their own theme tokens. Bubble value fitting remains a renderer concern through a compact class derived from the calculated radius.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS custom properties, SVG, Vitest, React Testing Library.

## Global Constraints

- Keep decision derivation, thresholds, supplier data, axes, positions, and bubble radii unchanged.
- Use black annual-cost text in every bubble in light and dark themes.
- Keep the bubble model-reason sentence and quantitative metadata hidden.
- Preserve responsive horizontal scrolling and current accessibility names.
- Keep the matrix legend and matrix reason behavior unchanged.

---

### Task 1: Bubble legend and fitted cost labels

**Files:**
- Modify: `app/supplier-portfolio-visualization.test.tsx`
- Modify: `app/supplier-portfolio-visualization.tsx`

**Interfaces:**
- Consumes: `DecisionLegend`, `SupplierBubbleLayout.radius`, and `formatCompactUsd(value)`.
- Produces: a visible `Decision heat legend` in both views and an `is-compact` class on cost labels in the smallest bubbles.

- [ ] **Step 1: Write the failing component tests**

Update the bubble-view assertions to require the shared legend and compact smallest-bubble label while keeping the model reason absent:

```tsx
const legend = screen.getByRole("list", { name: /decision heat legend/i });
expect(legend).toHaveTextContent("KeepConsolidateStrategic trade-offLow priority");
expect(screen.getByText("$800K")).toHaveClass("portfolio-bubble-cost", "is-compact");
expect(screen.queryByText("Quantitative comparison")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- app/supplier-portfolio-visualization.test.tsx`

Expected: FAIL because the bubble view does not render `Decision heat legend` and `$800K` lacks `is-compact`.

- [ ] **Step 3: Implement shared legend rendering and compact labels**

Render `DecisionLegend` for both views, but render the model reason only for the matrix:

```tsx
<div className={`portfolio-legend-row${isBubble ? " portfolio-bubble-legend-row" : ""}`}>
  <DecisionLegend />
  {!isBubble && <span className="portfolio-view-reason">{visualization.reason}</span>}
</div>
```

Derive the compact class from bubble radius without changing geometry:

```tsx
const compactCost = bubble.radius <= 20;
<text className={`portfolio-bubble-cost${compactCost ? " is-compact" : ""}`}>
  {formatCompactUsd(supplier.annualCostUsd)}
</text>
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- app/supplier-portfolio-visualization.test.tsx`

Expected: all component tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/supplier-portfolio-visualization.tsx app/supplier-portfolio-visualization.test.tsx
git commit -m "Add bubble decision legend and fitted labels"
```

### Task 2: Findings status separation and modern decision palette

**Files:**
- Modify: `app/supply-chain-app.test.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: existing `.status-protected`, `.status-consolidation-candidate`, `.portfolio-action-swatch`, and `.portfolio-bubble` class contracts.
- Produces: `--protected-*` tokens, `--decision-*-fill` tokens, blue Protected chips, green consolidation chips, matching legend/bubble fills, and uniform black bubble values.

- [ ] **Step 1: Write failing CSS contract assertions**

Extend the semantic token test:

```tsx
const requiredTokens = [
  "--protected-ink",
  "--protected-surface",
  "--decision-keep-fill",
  "--decision-consolidate-fill",
  "--decision-tradeoff-fill",
  "--decision-low-priority-fill",
];
expect(themeLayer).toMatch(/\.app-shell \.status-protected\s*\{[^}]*var\(--protected-ink\)[^}]*var\(--protected-surface\)/);
expect(themeLayer).toMatch(/\.portfolio-bubble-cost\s*\{[^}]*fill:\s*#111827;/);
expect(themeLayer).not.toContain(".portfolio-bubble.decision-strategic-trade-off .portfolio-bubble-cost");
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- app/supply-chain-app.test.tsx`

Expected: FAIL because Protected is grouped with success, fill tokens are absent, and bubble text is not uniformly black.

- [ ] **Step 3: Implement semantic status and fill tokens**

Add light and dark tokens:

```css
--protected-ink: #285d9f;
--protected-surface: #eaf2ff;
--decision-keep-fill: #ef9aa3;
--decision-consolidate-fill: #73d2a8;
--decision-tradeoff-fill: #f2c467;
--decision-low-priority-fill: #aeb8c7;
```

Separate status rules and use fill tokens for both legend and bubbles:

```css
.app-shell .status-on-schedule,
.app-shell .status-consolidation-candidate { color: var(--success-ink); background: var(--success-surface); }
.app-shell .status-protected { color: var(--protected-ink); background: var(--protected-surface); }
.portfolio-action-swatch.decision-keep { color: var(--decision-keep-fill); }
.portfolio-bubble.decision-keep circle { fill: var(--decision-keep-fill); }
.portfolio-bubble-cost { fill: #111827; }
.portfolio-bubble-cost.is-compact { font-size: 9px; letter-spacing: -.04em; }
```

Apply equivalent fill variables for all four decision classes and compatible dark-theme Protected tokens.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- app/supply-chain-app.test.tsx app/supplier-portfolio-visualization.test.tsx`

Expected: both test files PASS.

- [ ] **Step 5: Run full verification**

Run: `npm test && npm run typecheck && npm run build`

Expected: all tests PASS, TypeScript exits 0, and the Next.js production build completes.

- [ ] **Step 6: Verify the running dev server**

At `http://localhost:3000/`, render the executive bubble view and verify:

```text
Protected finding = blue
Consolidation candidate = green
Legend = Keep, Consolidate, Strategic trade-off, Low priority
Bubble values = black and contained
Light and dark themes = no console warnings or errors
```

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/supply-chain-app.test.tsx
git commit -m "Refine decision support colors"
```
