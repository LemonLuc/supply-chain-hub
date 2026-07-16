import type { UIMessage } from "ai";

import {
  parseSupplierPortfolioVisualization,
  supplierActions,
  supplierPortfolioBands,
  type ResolvedSupplierPortfolioItem,
  type SupplierAction,
  type SupplierPortfolioBand,
  type SupplierPortfolioVisualization,
} from "@/lib/supplier-portfolio";

const resilienceOrder: SupplierPortfolioBand[] = ["High", "Medium", "Low"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function actionSlug(action: SupplierAction): string {
  return action.toLowerCase();
}

function cellZone(cost: SupplierPortfolioBand, resilience: SupplierPortfolioBand): string {
  if (resilience === "Low") return "protect";
  if (resilience === "Medium") return cost === "High" ? "watch" : "optimize";
  return cost === "High" ? "optimize" : "balanced";
}

function formatSpend(value: number | undefined): string | undefined {
  return typeof value === "number" ? `€${value.toFixed(1)}M` : undefined;
}

function ActionLegend({ suppliers }: { suppliers: ResolvedSupplierPortfolioItem[] }) {
  const visibleActions = supplierActions.filter((action) =>
    suppliers.some((supplier) => supplier.action === action),
  );

  return (
    <ul className="portfolio-action-legend" aria-label="Decision action legend">
      {visibleActions.map((action) => (
        <li key={action}>
          <span className={`portfolio-action-swatch action-${actionSlug(action)}`} aria-hidden="true" />
          {action}
        </li>
      ))}
    </ul>
  );
}

function SupplierMarker({ supplier }: { supplier: ResolvedSupplierPortfolioItem }) {
  return (
    <article className={`supplier-marker action-${actionSlug(supplier.action)}`}>
      <div className="supplier-marker-heading">
        <strong>{supplier.supplier}</strong>
        <span>{supplier.action}</span>
      </div>
      <p>{supplier.recommendation}</p>
      {supplier.targetSupplier && (
        <small>Shift volume to {supplier.targetSupplier}</small>
      )}
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
      <table className="portfolio-matrix" aria-label="Supplier cost and resilience matrix">
        <thead>
          <tr>
            <th scope="col">Resilience / Cost</th>
            {supplierPortfolioBands.map((cost) => (
              <th scope="col" key={cost}>{cost} cost</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resilienceOrder.map((resilience) => (
            <tr key={resilience}>
              <th scope="row">{resilience} resilience</th>
              {supplierPortfolioBands.map((cost) => {
                const cellSuppliers = suppliers.filter(
                  (supplier) => supplier.cost === cost && supplier.resilience === resilience,
                );

                return (
                  <td
                    className={`portfolio-zone zone-${cellZone(cost, resilience)}`}
                    data-cost={cost}
                    data-resilience={resilience}
                    key={`${resilience}-${cost}`}
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

const bubblePlot = {
  width: 920,
  height: 500,
  left: 90,
  right: 70,
  top: 40,
  bottom: 70,
};

const plotWidth = bubblePlot.width - bubblePlot.left - bubblePlot.right;
const plotHeight = bubblePlot.height - bubblePlot.top - bubblePlot.bottom;
const chartTicks = [0, 25, 50, 75, 100];

function xPosition(score: number): number {
  return bubblePlot.left + (score / 100) * plotWidth;
}

function yPosition(score: number): number {
  return bubblePlot.top + (1 - score / 100) * plotHeight;
}

function bubbleRadius(
  supplier: ResolvedSupplierPortfolioItem,
  suppliers: ResolvedSupplierPortfolioItem[],
): number {
  const spends = suppliers
    .map((item) => item.annualSpendMillions)
    .filter((value): value is number => typeof value === "number");
  if (typeof supplier.annualSpendMillions !== "number" || spends.length === 0) return 21;

  const minimum = Math.min(...spends);
  const maximum = Math.max(...spends);
  if (minimum === maximum) return 23;
  const normalized = (supplier.annualSpendMillions - minimum) / (maximum - minimum);
  return 17 + Math.sqrt(normalized) * 13;
}

function SupplierBubbleChart({ suppliers }: { suppliers: ResolvedSupplierPortfolioItem[] }) {
  return (
    <div className="portfolio-bubble-wrap">
      <svg
        className="portfolio-bubble-chart"
        viewBox={`0 0 ${bubblePlot.width} ${bubblePlot.height}`}
        role="img"
        aria-label="Supplier cost and resilience bubble chart"
      >
        <title>Supplier cost and resilience bubble chart</title>
        <desc>
          Cost index increases from left to right. Resilience score increases from bottom to top.
          Bubble size represents annual spend where available.
        </desc>

        <g className="portfolio-chart-zones" aria-hidden="true">
          <rect className="zone-balanced" x={bubblePlot.left} y={bubblePlot.top} width={plotWidth / 2} height={plotHeight / 2} />
          <rect className="zone-optimize" x={bubblePlot.left + plotWidth / 2} y={bubblePlot.top} width={plotWidth / 2} height={plotHeight / 2} />
          <rect className="zone-watch" x={bubblePlot.left} y={bubblePlot.top + plotHeight / 2} width={plotWidth / 2} height={plotHeight / 2} />
          <rect className="zone-protect" x={bubblePlot.left + plotWidth / 2} y={bubblePlot.top + plotHeight / 2} width={plotWidth / 2} height={plotHeight / 2} />
        </g>

        <g className="portfolio-chart-grid" aria-hidden="true">
          {chartTicks.map((tick) => (
            <g key={`grid-${tick}`}>
              <line x1={xPosition(tick)} x2={xPosition(tick)} y1={bubblePlot.top} y2={bubblePlot.top + plotHeight} />
              <line x1={bubblePlot.left} x2={bubblePlot.left + plotWidth} y1={yPosition(tick)} y2={yPosition(tick)} />
              <text x={xPosition(tick)} y={bubblePlot.top + plotHeight + 27} textAnchor="middle">{tick}</text>
              <text x={bubblePlot.left - 18} y={yPosition(tick) + 4} textAnchor="end">{tick}</text>
            </g>
          ))}
        </g>

        <text className="portfolio-axis-label axis-x" x={bubblePlot.left + plotWidth / 2} y={bubblePlot.height - 15} textAnchor="middle">Cost index</text>
        <text
          className="portfolio-axis-label axis-y"
          x={22}
          y={bubblePlot.top + plotHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 22 ${bubblePlot.top + plotHeight / 2})`}
        >
          Resilience score
        </text>

        <g className="portfolio-bubbles">
          {suppliers.map((supplier) => {
            const costScore = supplier.costScore ?? 0;
            const resilienceScore = supplier.resilienceScore ?? 0;
            const x = xPosition(costScore);
            const y = yPosition(resilienceScore);
            const radius = bubbleRadius(supplier, suppliers);
            const labelOnLeft = costScore >= 45;
            const labelX = labelOnLeft ? x - radius - 10 : x + radius + 10;
            const spend = formatSpend(supplier.annualSpendMillions);

            return (
              <g className={`portfolio-bubble action-${actionSlug(supplier.action)}`} key={supplier.supplier}>
                <title>
                  {supplier.supplier}: cost index {costScore}, resilience score {resilienceScore}, {supplier.action}
                  {spend ? `, ${spend} annual spend` : ""}
                </title>
                <circle cx={x} cy={y} r={radius} />
                <text className="portfolio-bubble-name" x={labelX} y={y - 3} textAnchor={labelOnLeft ? "end" : "start"}>
                  {supplier.supplier}
                </text>
                <text className="portfolio-bubble-detail" x={labelX} y={y + 15} textAnchor={labelOnLeft ? "end" : "start"}>
                  {supplier.action}{spend ? ` · ${spend}` : ""}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
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
  const title = isBubble ? "Supplier portfolio bubble chart" : "Supplier cost–resilience matrix";
  const description = isBubble
    ? "Quantitative view · bubble size represents annual spend"
    : "Categorical view · cost versus resilience";

  return (
    <section className="supplier-portfolio-section" aria-labelledby="supplier-portfolio-title">
      <div className="section-title portfolio-section-title">
        <div>
          <p className="eyebrow">Decision support</p>
          <h3 id="supplier-portfolio-title">{title}</h3>
        </div>
        <span className="source-note">{description}</span>
      </div>
      <div className="portfolio-legend-row">
        <ActionLegend suppliers={visualization.suppliers} />
        <span className="portfolio-view-reason">{visualization.reason}</span>
      </div>
      {isBubble ? (
        <SupplierBubbleChart suppliers={visualization.suppliers} />
      ) : (
        <SupplierMatrix suppliers={visualization.suppliers} />
      )}
    </section>
  );
}
