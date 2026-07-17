export const supplierPortfolioBands = ["Low", "Medium", "High"] as const;
export const supplierPortfolioDecisions = [
  "Keep",
  "Consolidate",
  "Strategic trade-off",
  "Low priority",
] as const;
export const supplierPortfolioViews = ["matrix", "bubble"] as const;

export type SupplierPortfolioBand = (typeof supplierPortfolioBands)[number];
export type SupplierPortfolioDecision = (typeof supplierPortfolioDecisions)[number];
export type SupplierPortfolioView = (typeof supplierPortfolioViews)[number];

export type SupplierPortfolioItem = {
  supplier: string;
  recommendation: string;
  targetSupplier?: string;
  annualCostUsd: number;
  annualSavingsUsd: number;
  relationshipScore: number;
  relationshipDrivers?: string[];
};

export type ResolvedSupplierPortfolioItem = SupplierPortfolioItem & {
  decision: SupplierPortfolioDecision;
};

export type SupplierPortfolioVisualization = {
  view: SupplierPortfolioView;
  requestedView: SupplierPortfolioView;
  fallbackApplied: boolean;
  reason: string;
  suppliers: ResolvedSupplierPortfolioItem[];
};

export const supplierPortfolioDecisionThresholds = {
  annualSavingsUsd: 350_000,
  relationshipScore: 65,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isDecision(value: unknown): value is SupplierPortfolioDecision {
  return (
    typeof value === "string" &&
    supplierPortfolioDecisions.includes(value as SupplierPortfolioDecision)
  );
}

function isView(value: unknown): value is SupplierPortfolioView {
  return typeof value === "string" && supplierPortfolioViews.includes(value as SupplierPortfolioView);
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isRelationshipScore(value: unknown): value is number {
  return isNonNegativeFiniteNumber(value) && value <= 100;
}

function hasValidRelationshipDrivers(value: unknown): value is string[] | undefined {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.length > 0 &&
      value.every((driver) => typeof driver === "string" && driver.trim().length > 0))
  );
}

function isResolvedSupplier(value: unknown): value is ResolvedSupplierPortfolioItem {
  if (!isRecord(value)) return false;

  const supplier = value as Record<string, unknown>;
  if (
    typeof supplier.supplier !== "string" ||
    supplier.supplier.trim().length === 0 ||
    typeof supplier.recommendation !== "string" ||
    supplier.recommendation.trim().length === 0 ||
    (supplier.targetSupplier !== undefined && typeof supplier.targetSupplier !== "string") ||
    !isNonNegativeFiniteNumber(supplier.annualCostUsd) ||
    !isNonNegativeFiniteNumber(supplier.annualSavingsUsd) ||
    !isRelationshipScore(supplier.relationshipScore) ||
    !hasValidRelationshipDrivers(supplier.relationshipDrivers) ||
    !isDecision(supplier.decision)
  ) {
    return false;
  }

  return supplier.decision === deriveSupplierDecision(supplier as ResolvedSupplierPortfolioItem);
}

export function deriveSupplierDecision(
  item: Pick<SupplierPortfolioItem, "annualSavingsUsd" | "relationshipScore">,
): SupplierPortfolioDecision {
  const hasHighSavings =
    item.annualSavingsUsd >= supplierPortfolioDecisionThresholds.annualSavingsUsd;
  const hasHighRelationship =
    item.relationshipScore >= supplierPortfolioDecisionThresholds.relationshipScore;

  if (hasHighSavings && hasHighRelationship) return "Strategic trade-off";
  if (hasHighSavings) return "Consolidate";
  if (hasHighRelationship) return "Keep";
  return "Low priority";
}

export function getSavingsBand(annualSavingsUsd: number): SupplierPortfolioBand {
  if (annualSavingsUsd < 250_000) return "Low";
  if (annualSavingsUsd < 600_000) return "Medium";
  return "High";
}

export function getRelationshipBand(relationshipScore: number): SupplierPortfolioBand {
  if (relationshipScore < 50) return "Low";
  if (relationshipScore < 75) return "Medium";
  return "High";
}

export function canRenderBubble(suppliers: SupplierPortfolioItem[]): boolean {
  return (
    suppliers.length > 0 &&
    suppliers.every(
      (supplier) =>
        isNonNegativeFiniteNumber(supplier.annualCostUsd) &&
        isNonNegativeFiniteNumber(supplier.annualSavingsUsd) &&
        isRelationshipScore(supplier.relationshipScore),
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
      (view === "bubble"
        ? "Annual savings and strategic relationship comparison"
        : "Supplier decision heat map"),
    suppliers: suppliers.map((supplier) => ({
      ...supplier,
      decision: deriveSupplierDecision(supplier),
    })),
  };
}

export function getDemoPortfolioView(prompt: string): SupplierPortfolioView {
  const normalizedPrompt = prompt.toLowerCase();
  const asksForQuantitativeView = [
    "bubble",
    "plot",
    "quantitative",
    "annual savings",
    "savings potential",
    "relationship score",
    "heat map",
    "heatmap",
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
