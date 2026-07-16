import type { SupplierPortfolioItem } from "./supplier-portfolio";

export type BubbleChartBounds = {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type SupplierBubbleLayout = {
  supplier: string;
  x: number;
  y: number;
  radius: number;
  labelY: number;
};

export const supplierBubbleChartBounds: BubbleChartBounds = {
  width: 1_000,
  height: 520,
  left: 88,
  right: 52,
  top: 70,
  bottom: 100,
};

const SAVINGS_TICK_INTERVAL_USD = 250_000;
const MIN_BUBBLE_RADIUS = 18;
const MAX_BUBBLE_RADIUS = 46;
const BUBBLE_LABEL_GAP = 16;

function compactNumber(value: number, divisor: number): string {
  const dividedValue = value / divisor;
  return Number.isInteger(dividedValue) ? String(dividedValue) : dividedValue.toFixed(1);
}

export function formatCompactUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000) {
    return `${sign}$${compactNumber(absoluteValue, 1_000_000)}M`;
  }
  if (absoluteValue >= 1_000) {
    return `${sign}$${compactNumber(absoluteValue, 1_000)}K`;
  }
  return `${sign}$${Math.round(absoluteValue)}`;
}

export function getSavingsAxisMaximum(suppliers: readonly SupplierPortfolioItem[]): number {
  const maximumSavings = Math.max(0, ...suppliers.map((supplier) => supplier.annualSavingsUsd));
  return Math.max(
    SAVINGS_TICK_INTERVAL_USD,
    Math.ceil(maximumSavings / SAVINGS_TICK_INTERVAL_USD) * SAVINGS_TICK_INTERVAL_USD,
  );
}

export function buildBubbleChartLayout(
  suppliers: readonly SupplierPortfolioItem[],
  bounds: BubbleChartBounds,
): SupplierBubbleLayout[] {
  if (suppliers.length === 0) return [];

  const plotWidth = bounds.width - bounds.left - bounds.right;
  const plotHeight = bounds.height - bounds.top - bounds.bottom;
  const savingsMaximum = getSavingsAxisMaximum(suppliers);
  const annualCosts = suppliers.map((supplier) => supplier.annualCostUsd);
  const minimumCost = Math.min(...annualCosts);
  const maximumCost = Math.max(...annualCosts);
  const costRange = maximumCost - minimumCost;

  return suppliers.map((supplier) => {
    const normalizedCost = costRange === 0 ? 0.5 : (supplier.annualCostUsd - minimumCost) / costRange;
    const radius = Math.sqrt(
      MIN_BUBBLE_RADIUS ** 2 +
        normalizedCost * (MAX_BUBBLE_RADIUS ** 2 - MIN_BUBBLE_RADIUS ** 2),
    );
    const normalizedSavings = Math.min(1, Math.max(0, supplier.annualSavingsUsd / savingsMaximum));
    const normalizedRelationship = Math.min(1, Math.max(0, supplier.relationshipScore / 100));
    const x = bounds.left + normalizedSavings * plotWidth;
    const y = bounds.top + (1 - normalizedRelationship) * plotHeight;

    return {
      supplier: supplier.supplier,
      x,
      y,
      radius,
      labelY: y - radius - BUBBLE_LABEL_GAP,
    };
  });
}
