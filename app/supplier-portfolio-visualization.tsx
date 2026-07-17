import type { UIMessage } from "ai";

import {
  buildBubbleChartLayout,
  formatCompactEur,
  getSavingsAxisMaximum,
  supplierBubbleChartBounds,
} from "@/lib/supplier-portfolio-chart";
import {
  getRelationshipBand,
  getSavingsBand,
  parseSupplierPortfolioVisualization,
  supplierPortfolioBands,
  supplierPortfolioDecisions,
  type ResolvedSupplierPortfolioItem,
  type SupplierPortfolioBand,
  type SupplierPortfolioDecision,
  type SupplierPortfolioVisualization,
} from "@/lib/supplier-portfolio";

const relationshipOrder: SupplierPortfolioBand[] = ["High", "Medium", "Low"];
const relationshipTicks = [0, 25, 50, 75, 100];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function decisionSlug(decision: SupplierPortfolioDecision): string {
  return decision.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getBubbleValueTextLength(value: string, radius: number): number {
  return Math.min(value.length * 7, radius * 2 - 10);
}

function DecisionLegend() {
  return (
    <ul className="portfolio-action-legend" aria-label="Decision heat legend">
      {supplierPortfolioDecisions.map((decision) => (
        <li key={decision}>
          <span
            className={`portfolio-action-swatch decision-${decisionSlug(decision)}`}
            aria-hidden="true"
          />
          {decision}
        </li>
      ))}
    </ul>
  );
}

function SupplierMarker({ supplier }: { supplier: ResolvedSupplierPortfolioItem }) {
  return (
    <article className={`supplier-marker decision-${decisionSlug(supplier.decision)}`}>
      <div className="supplier-marker-heading">
        <strong>{supplier.supplier}</strong>
        <span>{supplier.decision}</span>
      </div>
      <p>{supplier.recommendation}</p>
      <dl className="supplier-marker-measures">
        <div>
          <dt>Savings</dt>
          <dd>{formatCompactEur(supplier.annualSavingsUsd)}</dd>
        </div>
        <div>
          <dt>Relationship</dt>
          <dd>{supplier.relationshipScore}/100</dd>
        </div>
      </dl>
      {supplier.targetSupplier && <small>Shift volume to {supplier.targetSupplier}</small>}
    </article>
  );
}

function SupplierMatrix({ suppliers }: { suppliers: ResolvedSupplierPortfolioItem[] }) {
  return (
    <div
      className="portfolio-matrix-scroll"
      role="region"
      aria-label="Scrollable supplier decision matrix"
      tabIndex={0}
    >
      <table
        className="portfolio-matrix"
        aria-label="Supplier savings and strategic relationship matrix"
      >
        <thead>
          <tr>
            <th scope="col">Strategic relationship / Annual savings</th>
            {supplierPortfolioBands.map((savings) => (
              <th scope="col" key={savings}>{savings} savings</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {relationshipOrder.map((relationship) => (
            <tr key={relationship}>
              <th scope="row">{relationship} relationship</th>
              {supplierPortfolioBands.map((savings) => {
                const cellSuppliers = suppliers.filter(
                  (supplier) =>
                    getSavingsBand(supplier.annualSavingsUsd) === savings &&
                    getRelationshipBand(supplier.relationshipScore) === relationship,
                );

                return (
                  <td
                    className="portfolio-zone"
                    data-savings={savings}
                    data-relationship={relationship}
                    key={`${relationship}-${savings}`}
                  >
                    {cellSuppliers.length > 0 ? (
                      cellSuppliers.map((supplier) => (
                        <SupplierMarker key={supplier.supplier} supplier={supplier} />
                      ))
                    ) : (
                      <span className="portfolio-empty-cell" aria-label="No suppliers in this segment">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SupplierBubbleChart({ suppliers }: { suppliers: ResolvedSupplierPortfolioItem[] }) {
  const bounds = supplierBubbleChartBounds;
  const plotWidth = bounds.width - bounds.left - bounds.right;
  const plotHeight = bounds.height - bounds.top - bounds.bottom;
  const savingsMaximum = getSavingsAxisMaximum(suppliers);
  const savingsTicks = Array.from({ length: 5 }, (_, index) => (savingsMaximum * index) / 4);
  const layout = buildBubbleChartLayout(suppliers, bounds);
  const layoutBySupplier = new Map(layout.map((bubble) => [bubble.supplier, bubble]));
  const xPosition = (savings: number) => bounds.left + (savings / savingsMaximum) * plotWidth;
  const yPosition = (relationship: number) =>
    bounds.top + (1 - relationship / 100) * plotHeight;

  return (
    <div className="portfolio-bubble-wrap">
      <svg
        className="portfolio-bubble-chart"
        viewBox={`0 0 ${bounds.width} ${bounds.height}`}
        role="img"
        aria-label="Supplier savings and strategic relationship map"
      >
        <title>Supplier savings and strategic relationship map</title>
        <desc>
          Annual consolidation savings increase from left to right. Strategic relationship score
          increases from bottom to top. Bubble area represents annual supplier cost.
        </desc>

        <g className="portfolio-chart-grid" aria-hidden="true">
          {savingsTicks.map((tick) => (
            <g key={`savings-${tick}`}>
              <line
                x1={xPosition(tick)}
                x2={xPosition(tick)}
                y1={bounds.top}
                y2={bounds.top + plotHeight}
              />
              <text
                x={xPosition(tick)}
                y={bounds.top + plotHeight + 29}
                textAnchor="middle"
              >
                {formatCompactEur(tick)}
              </text>
            </g>
          ))}
          {relationshipTicks.map((tick) => (
            <g key={`relationship-${tick}`}>
              <line
                x1={bounds.left}
                x2={bounds.left + plotWidth}
                y1={yPosition(tick)}
                y2={yPosition(tick)}
              />
              <text
                x={bounds.left - 18}
                y={yPosition(tick) + 4}
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          ))}
        </g>

        <text
          className="portfolio-axis-label axis-x"
          x={bounds.left + plotWidth / 2}
          y={bounds.height - 21}
          textAnchor="middle"
        >
          Annual consolidation savings (EUR)
        </text>
        <text
          className="portfolio-axis-label axis-y"
          x={25}
          y={bounds.top + plotHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 25 ${bounds.top + plotHeight / 2})`}
        >
          Strategic relationship score (0–100)
        </text>

        <g className="portfolio-bubbles">
          {suppliers.map((supplier) => {
            const bubble = layoutBySupplier.get(supplier.supplier);
            if (!bubble) return null;
            const compactCost = bubble.radius <= 20;
            const formattedCost = formatCompactEur(supplier.annualCostUsd);

            return (
              <g
                className={`portfolio-bubble decision-${decisionSlug(supplier.decision)}`}
                key={supplier.supplier}
              >
                <title>
                  {supplier.supplier}: {formatCompactEur(supplier.annualSavingsUsd)} savings,
                  {` ${supplier.relationshipScore}/100 relationship, ${supplier.decision}, ${formatCompactEur(supplier.annualCostUsd)} supplier cost`}
                </title>
                <text
                  className="portfolio-bubble-name"
                  x={bubble.x}
                  y={bubble.labelY}
                  textAnchor="middle"
                >
                  {supplier.supplier}
                </text>
                <circle cx={bubble.x} cy={bubble.y} r={bubble.radius} />
                <text
                  className={`portfolio-bubble-cost${compactCost ? " is-compact" : ""}`}
                  x={bubble.x}
                  y={bubble.y + 5}
                  textAnchor="middle"
                  textLength={getBubbleValueTextLength(formattedCost, bubble.radius)}
                  lengthAdjust="spacingAndGlyphs"
                >
                  {formattedCost}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <p className="portfolio-relationship-note">
        Relationship score combines reliability, quality, qualification depth, supply continuity,
        and switching complexity.
      </p>
    </div>
  );
}

export function getMessagePortfolioVisualization(
  messages: UIMessage[],
): SupplierPortfolioVisualization | undefined {
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  if (!latestAssistantMessage) return undefined;

  for (const part of [...latestAssistantMessage.parts].reverse()) {
    if (!isRecord(part)) continue;
    if (part.type !== "tool-renderSupplierPortfolio") continue;
    if (part.state !== "output-available") continue;

    const visualization = parseSupplierPortfolioVisualization(part.output);
    if (visualization) return visualization;
  }

  return undefined;
}

export function SupplierPortfolioVisualizationView({
  visualization,
}: {
  visualization: SupplierPortfolioVisualization;
}) {
  const isBubble = visualization.view === "bubble";
  const title = isBubble
    ? "Supplier savings–relationship map"
    : "Supplier savings–relationship matrix";

  return (
    <section className="supplier-portfolio-section" aria-labelledby="supplier-portfolio-title">
      <div className="section-title portfolio-section-title">
        <div>
          <p className="eyebrow">Decision support</p>
          <h3 id="supplier-portfolio-title">{title}</h3>
        </div>
        {!isBubble && <span className="source-note">Savings versus strategic relationship</span>}
      </div>
      <div className={`portfolio-legend-row${isBubble ? " portfolio-bubble-legend-row" : ""}`}>
        <DecisionLegend />
        {!isBubble && <span className="portfolio-view-reason">{visualization.reason}</span>}
      </div>
      {isBubble ? (
        <SupplierBubbleChart suppliers={visualization.suppliers} />
      ) : (
        <SupplierMatrix suppliers={visualization.suppliers} />
      )}
    </section>
  );
}
