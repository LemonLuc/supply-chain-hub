# Adaptive Supplier Portfolio Visualization Design

## Context

The executive supplier portfolio currently renders five static cards even though the section is described as a cost-versus-resilience heat map. The cards communicate recommendations, but they do not encode either axis. The chat response and the result visualization are also separate: the streamed model response is text and reasoning, while `buildAppContext` supplies deterministic `heatMap` data directly to the page.

The feature will support both a categorical decision matrix and a quantitative bubble chart. A live model may recommend a view, but the application remains responsible for validating the request, selecting a safe fallback, and supplying trusted supplier data. Demo mode will exercise the same view-selection rules without requiring an API key.

## Goals

- Render a genuine cost-versus-resilience matrix when only categorical bands are available.
- Render a quantitative bubble chart when complete numeric measures are available and the model prefers that view.
- Keep supplier values, permissions, and recommendations grounded in the server-built application context.
- Fall back to the matrix for missing, malformed, unauthorized, or incomplete model output.
- Establish a cohesive, accessible color system for the portfolio visualization and the wider application in light and dark themes.
- Preserve the current workflows, approval boundaries, responsive behavior, and demo-mode experience.

## Non-goals

- The model will not generate arbitrary chart markup, SVG, colors, or supplier records.
- The application will not parse natural-language answer text to determine which chart to render.
- This change will not add a charting dependency or redesign the application's information architecture.
- This change will not allow a browser-selected persona or model tool call to bypass server-side permissions.

## Considered Approaches

### 1. Model-generated visualization payload

The model could return the view and every supplier value. This is flexible but duplicates trusted application data and creates an avoidable hallucination and authorization surface. Rejected.

### 2. Parse the model's prose

The client could search the answer for phrases such as “bubble chart” or “heat map.” This is brittle, difficult to validate, and couples presentation to wording. Rejected.

### 3. Model chooses the view; the server supplies the data

The model calls a typed `renderSupplierPortfolio` tool with only `preferredView` and a short reason. The tool closes over the authorized `AppContext`, validates numeric eligibility, and returns a normalized visualization payload. This preserves useful model judgment while keeping values and permissions deterministic. Selected.

## Data Contract

Each supplier portfolio item keeps its categorical fields and may include quantitative fields:

```ts
type SupplierPortfolioItem = {
  supplier: string;
  cost: "Low" | "Medium" | "High";
  resilience: "Low" | "Medium" | "High";
  action: "Retain" | "Consolidate" | "Protect" | "Review";
  recommendation: string;
  targetSupplier?: string;
  costScore?: number;          // normalized 0–100, higher is more expensive
  resilienceScore?: number;    // normalized 0–100, higher is more resilient
  annualSpendMillions?: number;
};
```

The renderer consumes a discriminated payload:

```ts
type SupplierPortfolioVisualization = {
  view: "matrix" | "bubble";
  requestedView: "matrix" | "bubble";
  fallbackApplied: boolean;
  reason: string;
  suppliers: SupplierPortfolioItem[];
};
```

`bubble` is eligible only when every visible supplier has finite in-range `costScore` and `resilienceScore` values. Spend controls bubble size when present; otherwise all bubbles use the same size. Any invalid payload resolves to `matrix`.

## Server and Model Flow

1. `buildAppContext` continues to enforce persona and source permissions and includes the trusted supplier portfolio only for authorized executive requests.
2. The live chat route registers `renderSupplierPortfolio` only when decision-support data exists.
3. The system prompt tells the model to call this tool once for supplier-portfolio answers and to choose `bubble` only when a quantitative plot materially improves the answer.
4. The tool accepts only `preferredView` and `reason`; it never accepts supplier data from the model.
5. The tool execution normalizes the trusted context through `resolveSupplierPortfolioVisualization` and returns the discriminated payload.
6. Multi-step streaming allows the model to continue with its concise textual answer after the tool result.
7. The client reads the most recent completed `renderSupplierPortfolio` tool output. If none exists, it builds a deterministic payload from `appContext`.
8. Demo mode selects `bubble` for explicit quantitative, plot, or bubble-chart prompts and otherwise selects `matrix`, then runs the same resolver.

The results section remains hidden while a response is streaming, so the model-selected visualization replaces the fallback without a visible layout jump.

## UI Components

### `SupplierPortfolioVisualization`

This shared section renders the heading, view description, action legend, and the selected child chart. It exposes an accessible summary of supplier count, axes, and selection logic.

### `SupplierMatrix`

- Uses columns for low, medium, and high cost.
- Uses rows for high, medium, and low resilience so the strongest strategic position appears first.
- Places supplier markers in the corresponding cells.
- Shows the supplier, action, and recommendation without repeating axis values as badges.
- Shows an explicit target label for consolidation transfers such as Steripack to MediSeal.
- Uses subtle decision-pressure cell surfaces while action colors remain attached to labeled supplier markers.

### `SupplierBubbleChart`

- Uses a normalized cost index on the x-axis and resilience score on the y-axis.
- Uses annual spend for bubble area when available.
- Uses action color plus visible action text; color is never the only carrier of meaning.
- Directly labels each supplier and includes SVG title/description text for assistive technology.
- Uses the same decision-pressure zones as the matrix so the two views tell one visual story.

No manual view toggle is added. The purpose of the feature is to reflect the model's validated presentation choice, and a toggle would introduce an additional source of state that the request does not require.

## Color System

The application will keep its current enterprise blue identity but consolidate visual values into semantic theme tokens.

- **Brand:** cobalt for primary actions, selected controls, and high-emphasis navigation.
- **Accent:** cyan/teal for supporting information, live states, and quantitative chart structure.
- **Retain:** green-teal, conveying a stable position.
- **Consolidate:** amber, conveying an optimization decision rather than success or failure.
- **Protect:** blue, conveying continuity and safeguard action.
- **Review:** violet, conveying an unresolved decision.
- **Success, warning, and danger:** separate semantic tokens with text, soft surface, and border variants.
- **Heat zones:** low-opacity balanced, optimize, watch, and protect surfaces. Labels and borders make their meaning explicit.

Light and dark themes receive independent token values with sufficient foreground contrast. Existing hard-coded light-only status and card colors will be replaced or overridden by these semantic tokens. The broader application retains restrained neutral surfaces so the decision colors remain meaningful instead of decorative.

## Responsive and Accessible Behavior

- The matrix remains a true axis-based grid. On narrow screens it receives a constrained horizontal overflow region rather than collapsing the axes into ambiguous cards.
- The bubble chart uses a responsive SVG view box and preserves label space at supported widths.
- Legends pair color with action names, and each marker contains visible action text.
- Focus indicators use the brand focus-ring token.
- Motion is limited to hover/focus emphasis and respects reduced-motion preferences.
- Both views include concise accessible descriptions and native section/table or SVG semantics.

## Error Handling and Fallbacks

- Missing or invalid tool output: render the deterministic matrix from authorized context.
- Bubble requested without complete numeric scores: render the matrix and mark `fallbackApplied` internally.
- No authorized portfolio data: render no portfolio section.
- Tool execution failure: preserve the textual answer and deterministic matrix.
- Invalid numeric values: ignore the model preference rather than clamping invented meaning into the chart.

## Testing

- Unit-test view selection, numeric eligibility, prompt-based demo preference, model input validation, and fallback behavior.
- Route-test that the portfolio tool is registered only for authorized portfolio context and that multi-step streaming is enabled.
- Component-test matrix placement, action labels, consolidation target, bubble rendering, and incomplete-data fallback.
- Preserve permission tests proving supplier data is not exposed to unauthorized personas.
- Run the full Vitest suite, strict TypeScript check, and production build.
- Inspect the executive workflow in light and dark themes at desktop and mobile widths.

