import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  resolveCostResilienceVisualization,
  supplierCostResilienceSnapshot,
} from "@/lib/supplier-cost-resilience";

import { SupplierCostResilienceVisualization } from "./supplier-cost-resilience-visualization";

describe("SupplierCostResilienceVisualization", () => {
  it("renders the historical bubble heat map exactly", () => {
    const visualization = resolveCostResilienceVisualization(
      supplierCostResilienceSnapshot,
      "bubble",
      "Quantitative comparison",
    );

    const { container } = render(
      <SupplierCostResilienceVisualization visualization={visualization} />,
    );

    expect(
      screen.getByRole("img", { name: /supplier cost and resilience bubble chart/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Supplier portfolio bubble chart" })).toBeInTheDocument();
    expect(screen.getByText("Quantitative view · bubble size represents annual spend")).toBeInTheDocument();
    expect(screen.getByText("Cost index")).toBeInTheDocument();
    expect(screen.getByText("Resilience score")).toBeInTheDocument();
    expect(screen.getByText("Protect · €3.1M")).toBeInTheDocument();
    expect(screen.getByText("MediSeal Jena")).toHaveAttribute("text-anchor", "end");
    expect(container.querySelectorAll(".portfolio-bubble")).toHaveLength(5);
    expect(
      [...container.querySelectorAll(".portfolio-chart-zones rect")].map((zone) =>
        zone.getAttribute("class"),
      ),
    ).toEqual(["zone-balanced", "zone-optimize", "zone-watch", "zone-protect"]);
    expect(screen.getByRole("list", { name: /decision action legend/i })).toHaveTextContent(
      "RetainConsolidateProtect",
    );
    expect(screen.queryByText(/annual consolidation savings/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/strategic relationship score/i)).not.toBeInTheDocument();
  });
});
