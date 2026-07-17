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
const BUBBLE_GAP = 6;
const BUBBLE_LABEL_GAP = 16;
const POSITION_GRID_STEP = 4;

type IndexedBubbleLayout = SupplierBubbleLayout & {
  index: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function canPlaceBubble(
  x: number,
  y: number,
  radius: number,
  placed: readonly IndexedBubbleLayout[],
): boolean {
  return placed.every(
    (bubble) => Math.hypot(x - bubble.x, y - bubble.y) >= radius + bubble.radius + BUBBLE_GAP,
  );
}

function findNearestAvailablePosition(
  anchor: IndexedBubbleLayout,
  placed: readonly IndexedBubbleLayout[],
  bounds: BubbleChartBounds,
): { x: number; y: number } | undefined {
  const minimumX = bounds.left + anchor.radius;
  const maximumX = bounds.width - bounds.right - anchor.radius;
  const minimumY = bounds.top + anchor.radius;
  const maximumY = bounds.height - bounds.bottom - anchor.radius;
  const anchorX = clamp(anchor.x, minimumX, maximumX);
  const anchorY = clamp(anchor.y, minimumY, maximumY);

  if (canPlaceBubble(anchorX, anchorY, anchor.radius, placed)) {
    return { x: anchorX, y: anchorY };
  }

  const candidates: Array<{ x: number; y: number; distanceSquared: number }> = [];
  for (let y = minimumY; y <= maximumY; y += POSITION_GRID_STEP) {
    for (let x = minimumX; x <= maximumX; x += POSITION_GRID_STEP) {
      const horizontalDistance = x - anchorX;
      const verticalDistance = y - anchorY;
      candidates.push({
        x,
        y,
        distanceSquared: horizontalDistance ** 2 + verticalDistance ** 2,
      });
    }
  }

  candidates.sort((first, second) => {
    const distanceDifference = first.distanceSquared - second.distanceSquared;
    if (distanceDifference !== 0) return distanceDifference;

    const verticalDifference =
      Math.abs(first.y - anchorY) - Math.abs(second.y - anchorY);
    if (verticalDifference !== 0) return verticalDifference;

    return Math.abs(first.x - anchorX) - Math.abs(second.x - anchorX);
  });

  return candidates.find((candidate) =>
    canPlaceBubble(candidate.x, candidate.y, anchor.radius, placed),
  );
}

function compactNumber(value: number, divisor: number): string {
  const dividedValue = value / divisor;
  return Number.isInteger(dividedValue) ? String(dividedValue) : dividedValue.toFixed(1);
}

export function formatCompactEur(value: number): string {
  if (!Number.isFinite(value)) return "€0";
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000) {
    return `${sign}€${compactNumber(absoluteValue, 1_000_000)}M`;
  }
  if (absoluteValue >= 1_000) {
    return `${sign}€${compactNumber(absoluteValue, 1_000)}K`;
  }
  return `${sign}€${Math.round(absoluteValue)}`;
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

  const anchors: IndexedBubbleLayout[] = suppliers.map((supplier, index) => {
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
      index,
      supplier: supplier.supplier,
      x,
      y,
      radius,
      labelY: y - radius - BUBBLE_LABEL_GAP,
    };
  });

  const placed: IndexedBubbleLayout[] = [];
  const placementOrder = [...anchors].sort(
    (first, second) => second.radius - first.radius || first.index - second.index,
  );

  for (const anchor of placementOrder) {
    const position = findNearestAvailablePosition(anchor, placed, bounds);
    if (!position) {
      throw new Error(`Unable to place ${anchor.supplier} without overlapping another bubble`);
    }

    placed.push({
      ...anchor,
      ...position,
      labelY: position.y - anchor.radius - BUBBLE_LABEL_GAP,
    });
  }

  return placed
    .sort((first, second) => first.index - second.index)
    .map(({ index: _index, ...bubble }) => bubble);
}
