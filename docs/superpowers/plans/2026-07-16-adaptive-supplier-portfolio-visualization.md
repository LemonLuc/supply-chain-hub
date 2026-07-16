# Adaptive Supplier Portfolio Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render a validated model-selected supplier matrix or bubble chart and apply one accessible semantic color system across the application.

**Architecture:** A focused `lib/supplier-portfolio.ts` module owns portfolio types, numeric eligibility, model-view resolution, demo preference, and output validation. The live model calls a view-selection tool that receives only a preferred view and reason; the tool supplies trusted server context. A dedicated React visualization module renders either the matrix or responsive SVG bubble chart, while `SupplyChainApp` extracts completed tool output and falls back to deterministic context data.

**Tech Stack:** Next.js App Router, React 19, strict TypeScript, Vercel AI SDK 6, Vitest, React Testing Library, CSS custom properties, inline SVG.

## Global Constraints

- The model must never supply supplier records, colors, SVG, or arbitrary chart markup.
- Bubble rendering requires finite 0–100 cost and resilience scores for every visible supplier.
- Missing or malformed model output must fall back to the categorical matrix.
- Supplier data remains protected by the existing server-derived `AppContext` permissions.
- No charting dependency is added.
- Light and dark themes must use semantic tokens with readable foreground, surface, and border variants.
- Color must be paired with visible action and zone labels.
- Existing workflows, approval boundaries, and demo behavior must remain intact.

---

## File Structure

- Create `lib/supplier-portfolio.ts`: portfolio types, action derivation, numeric eligibility, view resolver, demo preference, and runtime payload validation.
- Create `lib/supplier-portfolio.test.ts`: exhaustive domain and fallback tests.
- Modify `lib/demo-data.ts`: enrich trusted executive supplier data with action, transfer target, and normalized numeric values.
- Modify `lib/context.test.ts`: assert the enriched authorized context and unchanged access denial.
- Modify `lib/chat-extensions.ts`: expose the context-bound `renderSupplierPortfolio` tool.
- Modify `lib/chat.ts`: add portfolio tool-call instructions only when portfolio data exists.
- Modify `app/api/chat/route.ts`: pass context into the tool registry and enable the second model step after tool execution.
- Modify `app/api/chat/route.test.ts`: verify conditional tool registration, prompt instruction, and multi-step configuration.
- Create `app/supplier-portfolio-visualization.tsx`: accessible matrix, bubble chart, legend, and client-side tool-output extraction.
- Create `app/supplier-portfolio-visualization.test.tsx`: rendering, placement, label, and fallback tests.
- Modify `app/supply-chain-app.tsx`: replace the card list with the shared adaptive visualization.
- Modify `app/supply-chain-app.test.tsx`: verify matrix defaults, bubble prompts, and model-tool preference.
- Modify `app/globals.css`: add semantic light/dark tokens, adaptive chart styles, and application-wide token-based status/surface overrides.

---

### Task 1: Portfolio Domain and Validation

**Files:**
- Create: `lib/supplier-portfolio.ts`
- Create: `lib/supplier-portfolio.test.ts`

**Interfaces:**
- Produces: `SupplierAction`, `SupplierPortfolioItem`, `SupplierPortfolioView`, `SupplierPortfolioVisualization`.
- Produces: `deriveSupplierAction(item)`, `canRenderBubble(items)`, `resolveSupplierPortfolioVisualization(items, requestedView, reason)`, `getDemoPortfolioView(prompt)`, and `parseSupplierPortfolioVisualization(value)`.

- [ ] **Step 1: Write failing domain tests**

```ts
import { describe, expect, it } from "vitest";

import {
  canRenderBubble,
  deriveSupplierAction,
  getDemoPortfolioView,
  parseSupplierPortfolioVisualization,
  resolveSupplierPortfolioVisualization,
  type SupplierPortfolioItem,
} from "./supplier-portfolio";

const quantitativeItems: SupplierPortfolioItem[] = [
  {
    supplier: "MediSeal Jena",
    cost: "Medium",
    resilience: "High",
    action: "Retain",
    recommendation: "Retain as strategic source",
    costScore: 48,
    resilienceScore: 86,
    annualSpendMillions: 1.9,
  },
];

describe("supplier portfolio visualization", () => {
  it("uses a bubble chart only for complete finite normalized scores", () => {
    expect(canRenderBubble(quantitativeItems)).toBe(true);
    expect(canRenderBubble([{ ...quantitativeItems[0], resilienceScore: undefined }])).toBe(false);
    expect(canRenderBubble([{ ...quantitativeItems[0], costScore: 101 }])).toBe(false);
  });

  it("falls back to the matrix when bubble data is incomplete", () => {
    expect(resolveSupplierPortfolioVisualization(
      [{ ...quantitativeItems[0], costScore: undefined }],
      "bubble",
      "Compare the quantitative measures.",
    )).toMatchObject({ view: "matrix", requestedView: "bubble", fallbackApplied: true });
  });

  it("derives a stable action for legacy items", () => {
    expect(deriveSupplierAction({ ...quantitativeItems[0], action: undefined })).toBe("Retain");
  });

  it("selects the demo view from explicit presentation intent", () => {
    expect(getDemoPortfolioView("Plot this as a quantitative bubble chart.")).toBe("bubble");
    expect(getDemoPortfolioView("Show the supplier heat map.")).toBe("matrix");
  });

  it("accepts valid tool output and rejects malformed output", () => {
    const output = resolveSupplierPortfolioVisualization(quantitativeItems, "bubble", "Quantitative comparison");
    expect(parseSupplierPortfolioVisualization(output)).toEqual(output);
    expect(parseSupplierPortfolioVisualization({ ...output, suppliers: [{ supplier: "Invented" }] })).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the focused test and verify the missing-module failure**

Run: `npm test -- lib/supplier-portfolio.test.ts`

Expected: FAIL because `./supplier-portfolio` does not exist.

- [ ] **Step 3: Implement the domain module**

Implement literal string unions for bands, actions, and views; validate every runtime field with narrow type guards; copy arrays before returning them; treat an empty supplier array as ineligible for bubbles; normalize the reason to a concise non-empty fallback string; and never coerce invalid numeric values.

Core resolver:

```ts
export function resolveSupplierPortfolioVisualization(
  suppliers: SupplierPortfolioItem[],
  requestedView: SupplierPortfolioView,
  reason: string,
): SupplierPortfolioVisualization {
  const view = requestedView === "bubble" && canRenderBubble(suppliers) ? "bubble" : "matrix";

  return {
    view,
    requestedView,
    fallbackApplied: view !== requestedView,
    reason: reason.trim() || (view === "bubble" ? "Quantitative portfolio comparison" : "Categorical portfolio comparison"),
    suppliers: suppliers.map((supplier) => ({
      ...supplier,
      action: supplier.action ?? deriveSupplierAction(supplier),
    })),
  };
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- lib/supplier-portfolio.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the domain module**

```bash
git add lib/supplier-portfolio.ts lib/supplier-portfolio.test.ts
git commit -m "Add supplier portfolio view resolver"
```

---

### Task 2: Trusted Quantitative Demo Data

**Files:**
- Modify: `lib/demo-data.ts`
- Modify: `lib/context.test.ts`

**Interfaces:**
- Consumes: `SupplierPortfolioItem` from `lib/supplier-portfolio.ts`.
- Produces: authorized executive context with categorical and quantitative supplier fields.

- [ ] **Step 1: Update the context test with explicit trusted fields**

Replace the five-item equality assertion with `toMatchObject` entries that include `action`, normalized scores, spend, and the Steripack transfer target. Add finite range assertions:

```ts
const portfolio = context.decisionSupport?.heatMap ?? [];
expect(portfolio).toHaveLength(5);
expect(portfolio[0]).toMatchObject({
  supplier: "Steripack Hohenlohe",
  action: "Consolidate",
  targetSupplier: "MediSeal Jena",
  costScore: 84,
  resilienceScore: 82,
});
expect(portfolio.every((item) =>
  typeof item.costScore === "number" &&
  item.costScore >= 0 &&
  item.costScore <= 100 &&
  typeof item.resilienceScore === "number" &&
  item.resilienceScore >= 0 &&
  item.resilienceScore <= 100
)).toBe(true);
```

- [ ] **Step 2: Run the context test and verify missing-field failure**

Run: `npm test -- lib/context.test.ts`

Expected: FAIL because the demo records do not contain the new fields.

- [ ] **Step 3: Enrich the five demo records**

Import `SupplierPortfolioItem`, make `HeatMapItem` an alias for compatibility, and add these trusted measures:

```ts
{ supplier: "Steripack Hohenlohe", cost: "High", resilience: "High", action: "Consolidate", recommendation: "Consolidate volume into MediSeal Jena", targetSupplier: "MediSeal Jena", costScore: 84, resilienceScore: 82, annualSpendMillions: 2.6 },
{ supplier: "MediSeal Jena", cost: "Medium", resilience: "High", action: "Retain", recommendation: "Retain as strategic packaging source", costScore: 48, resilienceScore: 88, annualSpendMillions: 2.2 },
{ supplier: "PräziForm Aalen", cost: "High", resilience: "Medium", action: "Consolidate", recommendation: "Renegotiate or consolidate bracket volume", costScore: 78, resilienceScore: 58, annualSpendMillions: 1.7 },
{ supplier: "Glaswerke Mainz", cost: "High", resilience: "Low", action: "Protect", recommendation: "Protect and qualify backup capacity", costScore: 88, resilienceScore: 28, annualSpendMillions: 3.1 },
{ supplier: "OptiQuartz Suhl", cost: "Medium", resilience: "Low", action: "Retain", recommendation: "Retain for optical glass redundancy", costScore: 55, resilienceScore: 34, annualSpendMillions: 2.4 },
```

- [ ] **Step 4: Run context and permission tests**

Run: `npm test -- lib/context.test.ts lib/permissions.test.ts`

Expected: PASS, including the restricted-persona non-disclosure assertion.

- [ ] **Step 5: Commit trusted data changes**

```bash
git add lib/demo-data.ts lib/context.test.ts
git commit -m "Enrich supplier portfolio decision data"
```

---

### Task 3: Model View-Selection Tool

**Files:**
- Modify: `lib/chat-extensions.ts`
- Modify: `lib/chat.ts`
- Modify: `app/api/chat/route.ts`
- Modify: `app/api/chat/route.test.ts`

**Interfaces:**
- Consumes: authorized `AppContext` and `resolveSupplierPortfolioVisualization`.
- Produces: `getChatTools(context)` with conditional `renderSupplierPortfolio`.
- Produces: a completed tool output consumable as `tool-renderSupplierPortfolio`.

- [ ] **Step 1: Write failing route assertions**

For an executive consolidation request, assert that the `streamText` options contain the tool and two-step stop condition. For a logistics request, assert that the tool map is empty. Execute the tool directly from captured options and verify that invented supplier input is impossible because only `preferredView` and `reason` are accepted.

```ts
const options = streamTextMock.mock.calls[0][0] as {
  tools: Record<string, { execute?: (input: unknown) => Promise<unknown> | unknown }>;
  stopWhen: unknown;
  system: string;
};
expect(options.tools).toHaveProperty("renderSupplierPortfolio");
expect(options.stopWhen).toBeDefined();
expect(options.system).toContain("Call renderSupplierPortfolio exactly once");
const output = await options.tools.renderSupplierPortfolio.execute?.({
  preferredView: "bubble",
  reason: "Quantitative measures are complete.",
});
expect(output).toMatchObject({ view: "bubble", requestedView: "bubble" });
```

- [ ] **Step 2: Run the route tests and verify failure**

Run: `npm test -- app/api/chat/route.test.ts`

Expected: FAIL because tools are context-free and no stop condition is configured.

- [ ] **Step 3: Implement the conditional tool**

Use `tool` and `jsonSchema` from `ai`. Define a strict schema with `additionalProperties: false`, `preferredView` enum values, and a bounded reason. Return `{}` when no authorized heat map exists. The execute function passes only trusted `context.decisionSupport.heatMap` into the resolver.

- [ ] **Step 4: Add the portfolio-only system instruction**

In `buildSystemPrompt`, append these priorities only when decision support exists:

```text
- Call renderSupplierPortfolio exactly once for this supplier-portfolio answer.
- Choose bubble only when the normalized numeric measures materially improve the comparison; otherwise choose matrix.
- The tool supplies trusted supplier data. Do not repeat or invent supplier values in tool input.
```

- [ ] **Step 5: Wire context and multi-step execution into the route**

Import `stepCountIs`, call `getChatTools(context)`, and set `stopWhen: stepCountIs(2)` so the model can write its concise text after the tool result.

- [ ] **Step 6: Run route and chat tests**

Run: `npm test -- app/api/chat/route.test.ts lib/chat.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the live model integration**

```bash
git add lib/chat-extensions.ts lib/chat.ts app/api/chat/route.ts app/api/chat/route.test.ts lib/chat.test.ts
git commit -m "Add model-selected portfolio visualization tool"
```

---

### Task 4: Matrix and Bubble Renderers

**Files:**
- Create: `app/supplier-portfolio-visualization.tsx`
- Create: `app/supplier-portfolio-visualization.test.tsx`

**Interfaces:**
- Consumes: `SupplierPortfolioVisualization`, `resolveSupplierPortfolioVisualization`, `getDemoPortfolioView`, and `parseSupplierPortfolioVisualization`.
- Produces: `SupplierPortfolioVisualizationView` React component and `getMessagePortfolioVisualization(messages)` helper.

- [ ] **Step 1: Write failing renderer tests**

Cover these user-visible assertions:

```tsx
render(<SupplierPortfolioVisualizationView visualization={matrixPayload} />);
expect(screen.getByRole("table", { name: /supplier cost and resilience matrix/i })).toBeInTheDocument();
expect(screen.getByText("Steripack Hohenlohe")).toBeInTheDocument();
expect(screen.getByText(/Shift volume to MediSeal Jena/i)).toBeInTheDocument();
expect(screen.getByText("Protect")).toBeInTheDocument();

render(<SupplierPortfolioVisualizationView visualization={bubblePayload} />);
expect(screen.getByRole("img", { name: /supplier cost and resilience bubble chart/i })).toBeInTheDocument();
expect(screen.getByText("Cost index")).toBeInTheDocument();
expect(screen.getByText("Resilience score")).toBeInTheDocument();
```

Also verify that the message helper returns only a valid completed `renderSupplierPortfolio` output and ignores input-streaming, errors, and malformed outputs.

- [ ] **Step 2: Run the focused renderer test and verify failure**

Run: `npm test -- app/supplier-portfolio-visualization.test.tsx`

Expected: FAIL because the visualization module does not exist.

- [ ] **Step 3: Implement the shared section and matrix**

Render a semantic `<table>` with three cost columns and three resilience rows. Each cell receives a stable zone class computed from its row and column and contains supplier markers with visible action labels, recommendation copy, and transfer target text.

- [ ] **Step 4: Implement the responsive inline SVG bubble chart**

Use a `viewBox="0 0 920 500"`, fixed plot margins, 0/25/50/75/100 grid lines, and pure helper functions for x, y, and spend-based radius. Render zone rectangles first, then grid, axes, bubbles, and direct labels. Every bubble includes a `<title>` with supplier, cost, resilience, action, and spend.

- [ ] **Step 5: Implement tool-output extraction**

Walk assistant messages and parts in reverse order. Accept only `type === "tool-renderSupplierPortfolio"`, `state === "output-available"`, and an output that passes `parseSupplierPortfolioVisualization`.

- [ ] **Step 6: Run renderer tests**

Run: `npm test -- app/supplier-portfolio-visualization.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit the renderer**

```bash
git add app/supplier-portfolio-visualization.tsx app/supplier-portfolio-visualization.test.tsx
git commit -m "Add adaptive supplier portfolio charts"
```

---

### Task 5: Application Wiring and Demo Selection

**Files:**
- Modify: `app/supply-chain-app.tsx`
- Modify: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Consumes: `SupplierPortfolioVisualizationView`, `getMessagePortfolioVisualization`, `getDemoPortfolioView`, and `resolveSupplierPortfolioVisualization`.
- Produces: the final decision-support section selected from valid live output or deterministic demo fallback.

- [ ] **Step 1: Replace card-specific test expectations**

Assert the default executive prompt renders the matrix table and no bubble SVG. Add a quantitative prompt case that renders the bubble chart in demo mode. Add a synthetic UI stream containing a completed tool output requesting bubble and assert that output takes precedence over prompt fallback.

- [ ] **Step 2: Run the component test and verify failure**

Run: `npm test -- app/supply-chain-app.test.tsx`

Expected: FAIL because the application still renders `.heat-cell` cards.

- [ ] **Step 3: Compute the selected visualization**

Add a memoized value after `appContext`:

```ts
const portfolioVisualization = useMemo(() => {
  const modelVisualization = getMessagePortfolioVisualization(messages);
  if (modelVisualization) return modelVisualization;
  const suppliers = appContext.decisionSupport?.heatMap;
  return suppliers
    ? resolveSupplierPortfolioVisualization(suppliers, getDemoPortfolioView(activePrompt), "Selected from available portfolio measures")
    : undefined;
}, [activePrompt, appContext.decisionSupport?.heatMap, messages]);
```

- [ ] **Step 4: Replace the old heat-map markup**

Render `<SupplierPortfolioVisualizationView visualization={portfolioVisualization} />` inside results when the value exists. Remove `heatMapDecision` and obsolete card imports or helpers.

- [ ] **Step 5: Run component and context tests**

Run: `npm test -- app/supply-chain-app.test.tsx lib/context.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit application wiring**

```bash
git add app/supply-chain-app.tsx app/supply-chain-app.test.tsx
git commit -m "Render model-selected supplier portfolio view"
```

---

### Task 6: Semantic Color System and Responsive Chart Styling

**Files:**
- Modify: `app/globals.css`
- Modify: `app/supply-chain-app.test.tsx`

**Interfaces:**
- Consumes: matrix zone classes, action classes, and bubble SVG classes from Task 4.
- Produces: consistent light/dark application tokens and responsive chart presentation.

- [ ] **Step 1: Add a theme contract assertion**

Read `app/globals.css` in a Vitest node test and assert that both `.app-shell` themes define `--action-retain`, `--action-consolidate`, `--action-protect`, `--success-surface`, `--warning-surface`, and `--danger-surface`; assert the old `.heat-cell` rules are absent.

- [ ] **Step 2: Run the theme assertion and verify failure**

Run: `npm test -- app/supply-chain-app.test.tsx`

Expected: FAIL because the new semantic tokens and chart selectors are absent.

- [ ] **Step 3: Define light and dark semantic tokens**

Add independent values for brand, accent, canvas, surfaces, text, borders, focus ring, success, warning, danger, retain, consolidate, protect, review, and four heat-zone surfaces. Preserve cobalt as primary and cyan/teal as supporting accent.

- [ ] **Step 4: Replace application-wide hard-coded semantic colors**

Update message bubbles, status chips, approval cards, tasks, action notices, selected sources, tables, focus rings, and buttons to use the semantic tokens. Keep neutral surfaces restrained; do not assign category colors to unrelated cards.

- [ ] **Step 5: Add matrix and bubble styles**

Style the matrix wrapper, axis headers, heat zones, supplier markers, action legend, bubble plot, grid, labels, and focus/hover states. Use action colors only on markers and legend swatches. At widths below 700px, preserve a readable minimum matrix width inside an explicitly labeled overflow region and keep the SVG at full available width.

- [ ] **Step 6: Run component tests and type checking**

Run: `npm test -- app/supply-chain-app.test.tsx app/supplier-portfolio-visualization.test.tsx && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit the palette and chart styles**

```bash
git add app/globals.css app/supply-chain-app.test.tsx
git commit -m "Unify application and portfolio color system"
```

---

### Task 7: Full Verification and Visual Inspection

**Files:**
- Modify only files required by observed regressions.

**Interfaces:**
- Consumes: the complete feature.
- Produces: verified build and visually inspected light/dark responsive behavior.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: all Vitest files and tests pass.

- [ ] **Step 2: Run strict type checking**

Run: `npm run typecheck`

Expected: exit code 0 with no diagnostics.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: Next.js production build completes successfully.

- [ ] **Step 4: Start the local application and inspect the executive workflow**

Run: `npm run dev`

Inspect the default matrix and explicit bubble prompt at approximately 1440px, 768px, and 390px widths. Verify light and dark modes, readable labels, no clipped chart content, meaningful heat zones, and visible action labels without relying on color.

- [ ] **Step 5: Re-run checks after visual fixes**

Run: `npm test && npm run typecheck && npm run build`

Expected: all commands pass after any visual adjustments.

- [ ] **Step 6: Commit verification fixes if any files changed**

```bash
git add app lib
git commit -m "Polish adaptive portfolio visualization"
```

