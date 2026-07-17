import { describe, expect, it } from "vitest";

import { workflows } from "./demo-data";
import {
  buildBubbleChartLayout,
  formatCompactEur,
  getSavingsAxisMaximum,
  supplierBubbleChartBounds,
} from "./supplier-portfolio-chart";

const suppliers = workflows.consolidate.heatMap ?? [];

describe("supplier portfolio chart geometry", () => {
  it("formats compact EUR values for axes and bubbles", () => {
    expect(formatCompactEur(0)).toBe("€0");
    expect(formatCompactEur(120_000)).toBe("€120K");
    expect(formatCompactEur(2_100_000)).toBe("€2.1M");
    expect(formatCompactEur(4_600_000)).toBe("€4.6M");
    expect(formatCompactEur(-4_600_000)).toBe("-€4.6M");
  });

  it("rounds the savings axis up to a readable quarter-million interval", () => {
    expect(getSavingsAxisMaximum(suppliers)).toBe(1_000_000);
  });

  it("keeps savings and relationship positions semantically ordered", () => {
    const layout = buildBubbleChartLayout(suppliers, supplierBubbleChartBounds);
    const bySupplier = new Map(layout.map((bubble) => [bubble.supplier, bubble]));

    expect(bySupplier.get("HelioGlass Dresden")?.x).toBeGreaterThan(
      bySupplier.get("MediSeal Jena")?.x ?? 0,
    );
    expect(bySupplier.get("MediSeal Jena")?.y).toBeLessThan(
      bySupplier.get("FlexPack Esslingen")?.y ?? 0,
    );
    expect(bySupplier.get("Glaswerke Mainz")?.radius).toBeGreaterThan(
      bySupplier.get("FlexPack Esslingen")?.radius ?? 0,
    );
  });

  it("creates visibly different bubble sizes without overlapping the demo portfolio", () => {
    const layout = buildBubbleChartLayout(suppliers, supplierBubbleChartBounds);
    const radii = layout.map((bubble) => bubble.radius);

    expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThanOrEqual(26);

    for (let index = 0; index < layout.length; index += 1) {
      for (let comparisonIndex = index + 1; comparisonIndex < layout.length; comparisonIndex += 1) {
        const first = layout[index];
        const second = layout[comparisonIndex];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);

        expect(distance, `${first.supplier} overlaps ${second.supplier}`).toBeGreaterThanOrEqual(
          first.radius + second.radius + 6,
        );
      }
    }
  });

  it("separates bubbles when suppliers share the same semantic coordinates", () => {
    const collocatedSuppliers = suppliers.slice(0, 4).map((supplier) => ({
      ...supplier,
      annualSavingsUsd: 200_000,
      relationshipScore: 60,
    }));
    const layout = buildBubbleChartLayout(collocatedSuppliers, supplierBubbleChartBounds);

    for (let index = 0; index < layout.length; index += 1) {
      for (let comparisonIndex = index + 1; comparisonIndex < layout.length; comparisonIndex += 1) {
        const first = layout[index];
        const second = layout[comparisonIndex];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);

        expect(distance, `${first.supplier} overlaps ${second.supplier}`).toBeGreaterThanOrEqual(
          first.radius + second.radius + 6,
        );
      }
    }
  });

  it("places every company label a consistent distance above its bubble", () => {
    const layout = buildBubbleChartLayout(suppliers, supplierBubbleChartBounds);

    for (const bubble of layout) {
      expect(bubble.y - bubble.radius - bubble.labelY).toBe(16);
    }
  });
});
