# Decision-support color refinement design

## Goal

Make the supplier decision-support visuals easier to interpret without changing the decision model, supplier data, chart geometry, or application flow.

## Approved visual behavior

### Findings statuses

- `Consolidation candidate` remains green because it represents an actionable opportunity.
- `Protected` uses a cool blue treatment so continuity safeguards are visually distinct from consolidation recommendations.
- Other existing findings statuses retain their current semantic warning and danger treatments.
- The separation must work in both light and dark themes.

### Bubble chart

- Keep the existing decision meanings and shared four-color system:
  - `Keep`: modern coral.
  - `Consolidate`: modern mint green.
  - `Strategic trade-off`: modern warm amber.
  - `Low priority`: neutral slate.
- Use lighter, contemporary fills with restrained borders and shadows on the neutral plot surface.
- Render every annual-cost value inside a bubble in uniform black text, including dark theme.
- Adjust the cost-label font size for longer compact values so values such as `$800K`, `$2.1M`, and `$4.6M` remain inside their circles.
- Keep company names above bubbles and preserve the existing non-overlapping geometry.

### Bubble-chart legend

- Show the same four-item `Decision heat legend` above the bubble map that is already used for the matrix.
- Legend swatches must use the exact bubble colors.
- Do not restore the removed quantitative metadata or model-reason sentence in the bubble view.
- Keep the matrix legend and matrix reason behavior unchanged.

## Implementation boundaries

- Reuse `DecisionLegend` in both visualizations rather than duplicating legend markup.
- Add semantic theme tokens for the Protected findings status instead of hard-coded, view-specific colors.
- Keep decision derivation, thresholds, supplier data, axes, chart positions, and bubble radii unchanged.
- Preserve responsive horizontal chart scrolling and existing accessibility names.

## Verification

- Component tests verify that the bubble view exposes the four-item legend, keeps the model reason hidden, and assigns a compact-cost class for long values.
- Application/CSS contract tests verify distinct Protected and Consolidation status tokens and uniform black bubble text.
- Run the full Vitest suite, strict TypeScript check, and production build.
- Verify the live bubble chart and Findings table in light and dark themes at desktop width, plus bubble value fit at the mobile breakpoint.
