# Generic Prompts and Euro Portfolio Design

## Goal

Keep suggested questions timeless and generic while rendering every supplier heat-map currency value in euros.

## Prompt Design

The logistics suggestions use “this week” rather than a calendar-week number. The underlying risk question, evidence, delivery dates, and analysis trace remain anchored to July 2026 / CW 30; only the short clickable suggestions become generic.

The UI currently duplicates all persona prompt arrays. It will instead read each persona's suggestions from the corresponding workflow in `lib/demo-data.ts`. This makes the workflow record the single source of truth and prevents visible prompt copy from drifting again.

The two logistics prompts become:

- “Show me potential delivery risks for this week.”
- “Create a follow-up plan for delayed freight this week.”

The other logistics, procurement, and executive suggestions remain unchanged.

## Currency Design

The existing matrix and bubble visualizations already share `formatCompactUsd`. Rename that helper to `formatCompactEur` and use it for matrix savings, bubble-axis ticks, bubble cost labels, and accessible SVG titles. Change the bubble x-axis label from `Annual consolidation savings (USD)` to `Annual consolidation savings (EUR)`.

The internal `annualCostUsd` and `annualSavingsUsd` property names remain unchanged for compatibility with the current tool schema and mock payloads. This change affects presentation currency only and does not introduce exchange-rate conversion.

## Alternatives Rejected

- Renaming every portfolio field to EUR would expand a visual-copy request into an API/schema migration.
- Passing a currency option through every visualization layer would add configuration that the current single-currency application does not need.
- Replacing currency symbols separately in the React component would leave the shared formatter and accessible SVG text inconsistent.

## Testing

- Demo-data tests require generic prompt text and reject `CW 30` in `suggestedPrompts`.
- UI tests click the generic prompt and prove the request still resolves to the risk workflow.
- Chart tests require compact euro values, including zero, thousands, and millions.
- Visualization tests require EUR axis text and euro values in both matrix and bubble views, with no dollar symbols or USD axis label.
- Run the full test suite, strict TypeScript check, and production build.
