# Supplier Savings–Relationship Visualization Design

## Objective

Replace the supplier portfolio’s abstract cost-versus-resilience bubble chart with a decision-focused savings-versus-relationship view. The chart must show the annual savings available from consolidating each supplier, the strategic value of the relationship, and current annual supplier cost without relying on decorative background heat zones.

The LLM continues to choose between a categorical matrix and a quantitative bubble chart. Supplier facts, decision colors, and derived recommendations remain server-controlled.

## Approved visual direction

The bubble view uses the approved modern Option A:

- A neutral white plot on the application’s neutral canvas, with light grid lines and no colored quadrants.
- The x-axis is **Annual consolidation savings · USD** and displays currency ticks such as `$250K`, `$500K`, and `$1.0M`.
- The y-axis is **Strategic relationship score**, from 0 to 100.
- A short note explains that relationship score combines reliability, quality history, qualification depth, supply continuity, and switching complexity.
- Every supplier name is centered above its bubble with a fixed 16-pixel gap from the bubble edge.
- Every bubble contains only the supplier’s formatted annual cost, such as `$2.1M`.
- Bubble area is driven by annual cost. Radius uses square-root normalization into a restrained 18–46 pixel range so differences are visible without becoming theatrical.
- The seven demo suppliers are positioned far enough apart that their bubbles and labels do not overlap.
- Bubble shadows are subtle and modern. Bubbles have a thin neutral edge for contrast.

The bubble view removes the following interface elements:

- `Quantitative view · bubble size represents annual spend`
- The `Retain / Consolidate / Protect` action legend
- The model-generated chart-reason sentence

The title remains **Supplier savings–relationship map**.

## Decision heat logic

Color is derived from savings and relationship position. It is not assigned independently from a supplier action.

The decision thresholds are:

- High savings: annual consolidation savings of at least `$350,000`
- High relationship: strategic relationship score of at least `65`

The four decision zones are:

| Savings | Relationship | Decision | Color meaning |
| --- | --- | --- | --- |
| Low | High | Keep | Reddish; relationship value outweighs available savings |
| High | Low | Consolidate | Green; attractive savings with lower relationship disruption |
| High | High | Strategic trade-off | Amber/orange; savings and relationship value both matter |
| Low | Low | Low priority | Neutral slate; limited value and limited urgency |

The same decision tokens and labels are used by bubble fills, matrix supplier markers, matrix legend, and assistant decision language. Dark mode uses contrast-adjusted versions without changing the meaning of each color.

## Data model

Each supplier portfolio item contains:

- `supplier`
- `recommendation`
- optional `targetSupplier`
- `annualCostUsd`
- `annualSavingsUsd`
- `relationshipScore` from 0 to 100
- optional `relationshipDrivers` for accessible detail and future tooltips

Legacy `costScore`, `resilienceScore`, and `annualSpendMillions` fields are replaced for this portfolio visualization. The resolved supplier record also includes a server-derived `decision` of `Keep`, `Consolidate`, `Strategic trade-off`, or `Low priority`.

A bubble chart is valid only when every supplier has finite, non-negative annual cost and savings values and a finite relationship score from 0 to 100. Invalid or incomplete quantitative data falls back to the matrix.

## Realistic demo portfolio

| Supplier | Annual cost | Consolidation savings | Relationship | Derived decision |
| --- | ---: | ---: | ---: | --- |
| MediSeal Jena | $2.1M | $120K | 93 | Keep |
| OptiQuartz Suhl | $2.8M | $250K | 84 | Keep |
| PräziForm Aalen | $1.4M | $420K | 48 | Consolidate |
| Steripack Hohenlohe | $3.3M | $520K | 72 | Strategic trade-off |
| FlexPack Esslingen | $0.8M | $660K | 35 | Consolidate |
| Glaswerke Mainz | $4.6M | $740K | 90 | Strategic trade-off |
| HelioGlass Dresden | $2.3M | $910K | 70 | Strategic trade-off |

FlexPack Esslingen and HelioGlass Dresden are the two new suppliers.

## Matrix view

The fallback/alternative matrix uses the same concepts rather than retaining the old cost-versus-resilience wording:

- Title: **Supplier savings–relationship matrix**
- Columns: Low, medium, and high annual savings
- Rows: High, medium, and low strategic relationship
- Cell backgrounds remain neutral.
- Supplier markers carry the derived decision color and visible decision label.
- The legend uses Keep, Consolidate, Strategic trade-off, and Low priority with the same colors as the bubbles.

Matrix bands are derived from quantitative data:

- Savings: low below `$250K`, medium from `$250K` through `$599,999`, high from `$600K`
- Relationship: low below `50`, medium from `50` through `74`, high from `75`

These display bands provide categorical grouping. The heat decision still uses the `$350K` and `65` thresholds above.

## LLM and trust boundary

The model tool continues to receive only `preferredView` and `reason`. The server closes over the authorized supplier portfolio and returns the trusted resolved records.

The prompt tells the model to:

- choose bubble when the complete savings, cost, and relationship measures materially improve the answer;
- choose matrix for a categorical portfolio summary;
- use the server-derived decision terms consistently in the written answer;
- explain that a high-cost supplier may still be worth keeping because relationship score captures reliability, quality, qualification, continuity, and switching complexity.

Malformed, incomplete, or stale tool output is ignored. The current deterministic demo fallback follows the same rules.

## Accessibility and responsiveness

- The SVG title, description, and each bubble’s accessible title include supplier name, annual cost, annual savings, relationship score, decision, and relationship drivers when present.
- Currency is never communicated by size alone; the annual cost is printed inside every bubble.
- Decision is never communicated by color alone in the matrix; supplier markers include text labels.
- The chart remains a contained horizontal scroll region on small screens and never widens the document.
- The matrix remains a semantic table with row and column headers.
- Focus-visible and reduced-motion behavior use the application’s semantic theme tokens.

## Testing and verification

Automated tests cover:

- decision-zone derivation at and around both thresholds;
- quantitative validation and fallback to matrix;
- currency formatting and dynamic savings-axis maximum;
- annual-cost radius scaling, including the visible 18–46 pixel range;
- seven demo suppliers and the two new names;
- new axis names and removal of the old bubble metadata, legend, and reason;
- names above bubbles with a fixed gap;
- no overlapping demo bubbles;
- neutral plot backgrounds and consistent decision tokens in light and dark themes;
- matrix labels, band placement, legend, and marker colors;
- latest valid LLM tool output precedence and stale-output rejection.

Final verification runs `npm test`, `npm run typecheck`, and `npm run build`, followed by browser checks of matrix and bubble views in desktop light/dark modes and at a 390-pixel viewport.
