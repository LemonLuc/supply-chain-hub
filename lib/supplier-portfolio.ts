export const supplierPortfolioBands = ["Low", "Medium", "High"] as const;
export const supplierActions = ["Retain", "Consolidate", "Protect", "Review"] as const;
export const supplierPortfolioViews = ["matrix", "bubble"] as const;

export type SupplierPortfolioBand = (typeof supplierPortfolioBands)[number];
export type SupplierAction = (typeof supplierActions)[number];
export type SupplierPortfolioView = (typeof supplierPortfolioViews)[number];

export type SupplierPortfolioItem = {
  supplier: string;
  cost: SupplierPortfolioBand;
  resilience: SupplierPortfolioBand;
  action?: SupplierAction;
  recommendation: string;
  targetSupplier?: string;
  costScore?: number;
  resilienceScore?: number;
  annualSpendMillions?: number;
};

export type ResolvedSupplierPortfolioItem = Omit<SupplierPortfolioItem, "action"> & {
  action: SupplierAction;
};

export type SupplierPortfolioVisualization = {
  view: SupplierPortfolioView;
  requestedView: SupplierPortfolioView;
  fallbackApplied: boolean;
  reason: string;
  suppliers: ResolvedSupplierPortfolioItem[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isBand(value: unknown): value is SupplierPortfolioBand {
  return typeof value === "string" && supplierPortfolioBands.includes(value as SupplierPortfolioBand);
}

function isAction(value: unknown): value is SupplierAction {
  return typeof value === "string" && supplierActions.includes(value as SupplierAction);
}

function isView(value: unknown): value is SupplierPortfolioView {
  return typeof value === "string" && supplierPortfolioViews.includes(value as SupplierPortfolioView);
}

function isOptionalFiniteNumber(value: unknown): value is number | undefined {
  return value === undefined || (typeof value === "number" && Number.isFinite(value));
}

function isNormalizedScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function isResolvedSupplier(value: unknown): value is ResolvedSupplierPortfolioItem {
  if (!isRecord(value)) return false;

  return (
    typeof value.supplier === "string" &&
    value.supplier.trim().length > 0 &&
    isBand(value.cost) &&
    isBand(value.resilience) &&
    isAction(value.action) &&
    typeof value.recommendation === "string" &&
    value.recommendation.trim().length > 0 &&
    (value.targetSupplier === undefined || typeof value.targetSupplier === "string") &&
    isOptionalFiniteNumber(value.costScore) &&
    isOptionalFiniteNumber(value.resilienceScore) &&
    isOptionalFiniteNumber(value.annualSpendMillions) &&
    (value.costScore === undefined || isNormalizedScore(value.costScore)) &&
    (value.resilienceScore === undefined || isNormalizedScore(value.resilienceScore)) &&
    (value.annualSpendMillions === undefined || value.annualSpendMillions >= 0)
  );
}

export function deriveSupplierAction(item: SupplierPortfolioItem): SupplierAction {
  if (item.action && isAction(item.action)) return item.action;

  const recommendation = item.recommendation.toLowerCase();
  if (recommendation.includes("protect")) return "Protect";
  if (recommendation.includes("retain")) return "Retain";
  if (recommendation.includes("consolidate")) return "Consolidate";
  return "Review";
}

export function canRenderBubble(suppliers: SupplierPortfolioItem[]): boolean {
  return (
    suppliers.length > 0 &&
    suppliers.every(
      (supplier) =>
        isNormalizedScore(supplier.costScore) && isNormalizedScore(supplier.resilienceScore),
    )
  );
}

export function resolveSupplierPortfolioVisualization(
  suppliers: SupplierPortfolioItem[],
  requestedView: SupplierPortfolioView,
  reason: string,
): SupplierPortfolioVisualization {
  const view = requestedView === "bubble" && canRenderBubble(suppliers) ? "bubble" : "matrix";
  const normalizedReason = reason.trim().slice(0, 180);

  return {
    view,
    requestedView,
    fallbackApplied: view !== requestedView,
    reason:
      normalizedReason ||
      (view === "bubble" ? "Quantitative portfolio comparison" : "Categorical portfolio comparison"),
    suppliers: suppliers.map((supplier) => ({
      ...supplier,
      action: deriveSupplierAction(supplier),
    })),
  };
}

export function getDemoPortfolioView(prompt: string): SupplierPortfolioView {
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

export function parseSupplierPortfolioVisualization(
  value: unknown,
): SupplierPortfolioVisualization | undefined {
  if (!isRecord(value)) return undefined;
  if (!isView(value.view) || !isView(value.requestedView)) return undefined;
  if (typeof value.fallbackApplied !== "boolean") return undefined;
  if (value.fallbackApplied !== (value.view !== value.requestedView)) return undefined;
  if (typeof value.reason !== "string" || !value.reason.trim()) return undefined;
  if (!Array.isArray(value.suppliers) || value.suppliers.length === 0) return undefined;
  if (!value.suppliers.every(isResolvedSupplier)) return undefined;
  if (value.view === "bubble" && !canRenderBubble(value.suppliers)) return undefined;

  return {
    view: value.view,
    requestedView: value.requestedView,
    fallbackApplied: value.fallbackApplied,
    reason: value.reason.trim().slice(0, 180),
    suppliers: value.suppliers.map((supplier) => ({ ...supplier })),
  };
}
