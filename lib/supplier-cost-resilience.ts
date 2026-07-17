export const supplierCostResilienceBands = ["Low", "Medium", "High"] as const;
export const supplierCostResilienceActions = [
  "Retain",
  "Consolidate",
  "Protect",
  "Review",
] as const;
export const supplierCostResilienceViews = ["matrix", "bubble"] as const;

export type SupplierCostResilienceBand = (typeof supplierCostResilienceBands)[number];
export type SupplierCostResilienceAction = (typeof supplierCostResilienceActions)[number];
export type SupplierCostResilienceView = (typeof supplierCostResilienceViews)[number];

export type SupplierCostResilienceItem = {
  supplier: string;
  cost: SupplierCostResilienceBand;
  resilience: SupplierCostResilienceBand;
  action?: SupplierCostResilienceAction;
  recommendation: string;
  targetSupplier?: string;
  costScore?: number;
  resilienceScore?: number;
  annualSpendMillions?: number;
};

export type ResolvedSupplierCostResilienceItem = Omit<
  SupplierCostResilienceItem,
  "action"
> & {
  action: SupplierCostResilienceAction;
};

export type SupplierCostResilienceVisualization = {
  view: SupplierCostResilienceView;
  requestedView: SupplierCostResilienceView;
  fallbackApplied: boolean;
  reason: string;
  suppliers: ResolvedSupplierCostResilienceItem[];
};

export const supplierCostResilienceSnapshot: SupplierCostResilienceItem[] = [
  {
    supplier: "Steripack Hohenlohe",
    cost: "High",
    resilience: "High",
    action: "Consolidate",
    recommendation: "Consolidate volume into MediSeal Jena",
    targetSupplier: "MediSeal Jena",
    costScore: 84,
    resilienceScore: 82,
    annualSpendMillions: 2.6,
  },
  {
    supplier: "MediSeal Jena",
    cost: "Medium",
    resilience: "High",
    action: "Retain",
    recommendation: "Retain as strategic packaging source",
    costScore: 48,
    resilienceScore: 88,
    annualSpendMillions: 2.2,
  },
  {
    supplier: "PräziForm Aalen",
    cost: "High",
    resilience: "Medium",
    action: "Consolidate",
    recommendation: "Renegotiate or consolidate bracket volume",
    costScore: 78,
    resilienceScore: 58,
    annualSpendMillions: 1.7,
  },
  {
    supplier: "Glaswerke Mainz",
    cost: "High",
    resilience: "Low",
    action: "Protect",
    recommendation: "Protect and qualify backup capacity",
    costScore: 88,
    resilienceScore: 28,
    annualSpendMillions: 3.1,
  },
  {
    supplier: "OptiQuartz Suhl",
    cost: "Medium",
    resilience: "Low",
    action: "Retain",
    recommendation: "Retain for optical glass redundancy",
    costScore: 55,
    resilienceScore: 34,
    annualSpendMillions: 2.4,
  },
];

function isAction(value: unknown): value is SupplierCostResilienceAction {
  return (
    typeof value === "string" &&
    supplierCostResilienceActions.includes(value as SupplierCostResilienceAction)
  );
}

function isNormalizedScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

export function deriveSupplierCostResilienceAction(
  item: SupplierCostResilienceItem,
): SupplierCostResilienceAction {
  if (item.action && isAction(item.action)) return item.action;

  const recommendation = item.recommendation.toLowerCase();
  if (recommendation.includes("protect")) return "Protect";
  if (recommendation.includes("retain")) return "Retain";
  if (recommendation.includes("consolidate")) return "Consolidate";
  return "Review";
}

export function canRenderCostResilienceBubble(
  suppliers: SupplierCostResilienceItem[],
): boolean {
  return (
    suppliers.length > 0 &&
    suppliers.every(
      (supplier) =>
        isNormalizedScore(supplier.costScore) &&
        isNormalizedScore(supplier.resilienceScore),
    )
  );
}

export function resolveCostResilienceVisualization(
  suppliers: SupplierCostResilienceItem[],
  requestedView: SupplierCostResilienceView,
  reason: string,
): SupplierCostResilienceVisualization {
  const view =
    requestedView === "bubble" && canRenderCostResilienceBubble(suppliers)
      ? "bubble"
      : "matrix";
  const normalizedReason = reason.trim().slice(0, 180);

  return {
    view,
    requestedView,
    fallbackApplied: view !== requestedView,
    reason:
      normalizedReason ||
      (view === "bubble"
        ? "Quantitative portfolio comparison"
        : "Categorical portfolio comparison"),
    suppliers: suppliers.map((supplier) => ({
      ...supplier,
      action: deriveSupplierCostResilienceAction(supplier),
    })),
  };
}

export function getCostResiliencePortfolioView(
  prompt: string,
): SupplierCostResilienceView {
  const normalizedPrompt = prompt.toLowerCase();
  const asksForQuantitativeView = [
    "bubble",
    "plot",
    "quantitative",
    "cost score",
    "resilience score",
  ].some((term) => normalizedPrompt.includes(term));

  return asksForQuantitativeView ? "bubble" : "matrix";
}

export function asksForCostResilienceVisualization(prompt: string): boolean {
  const normalizedPrompt = prompt.toLowerCase();
  if (
    normalizedPrompt.includes("annual consolidation savings") ||
    normalizedPrompt.includes("strategic relationship")
  ) {
    return false;
  }

  const asksForVisual = /\b(visuali[sz]e|chart|graph|plot|heat\s*map|heatmap|bubble)\b/i.test(
    prompt,
  );
  if (!asksForVisual) return false;

  const namesHistoricalMeasures =
    (normalizedPrompt.includes("cost") && normalizedPrompt.includes("resilience")) ||
    normalizedPrompt.includes("cost score") ||
    normalizedPrompt.includes("resilience score");
  const namesSupplierHeatMap =
    /\bheat\s*map\b|\bheatmap\b/i.test(prompt) &&
    /\b(supplier|portfolio|consolidat(?:e|ion))\b/i.test(prompt);

  return namesHistoricalMeasures || namesSupplierHeatMap;
}
