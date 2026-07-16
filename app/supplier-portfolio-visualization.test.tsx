import { render, screen } from "@testing-library/react";
import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";

import {
  getMessagePortfolioVisualization,
  SupplierPortfolioVisualizationView,
} from "./supplier-portfolio-visualization";
import {
  resolveSupplierPortfolioVisualization,
  type SupplierPortfolioItem,
} from "@/lib/supplier-portfolio";

const suppliers: SupplierPortfolioItem[] = [
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
    supplier: "Glaswerke Mainz",
    cost: "High",
    resilience: "Low",
    action: "Protect",
    recommendation: "Protect and qualify backup capacity",
    costScore: 88,
    resilienceScore: 28,
    annualSpendMillions: 3.1,
  },
];

describe("SupplierPortfolioVisualizationView", () => {
  it("renders suppliers in a categorical cost and resilience matrix", () => {
    const visualization = resolveSupplierPortfolioVisualization(
      suppliers,
      "matrix",
      "Categorical comparison",
    );

    render(<SupplierPortfolioVisualizationView visualization={visualization} />);

    expect(
      screen.getByRole("table", { name: /supplier cost and resilience matrix/i }),
    ).toBeInTheDocument();
    const steripack = screen.getByText("Steripack Hohenlohe");
    expect(steripack.closest("td")).toHaveAttribute("data-cost", "High");
    expect(steripack.closest("td")).toHaveAttribute("data-resilience", "High");
    expect(screen.getByText("Shift volume to MediSeal Jena")).toBeInTheDocument();
    expect(screen.getAllByText("Protect").length).toBeGreaterThan(0);
  });

  it("renders a quantitative bubble chart with named axes and supplier details", () => {
    const visualization = resolveSupplierPortfolioVisualization(
      suppliers,
      "bubble",
      "Quantitative comparison",
    );

    render(<SupplierPortfolioVisualizationView visualization={visualization} />);

    expect(
      screen.getByRole("img", { name: /supplier cost and resilience bubble chart/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cost index")).toBeInTheDocument();
    expect(screen.getByText("Resilience score")).toBeInTheDocument();
    expect(screen.getByText("Protect · €3.1M")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("extracts only completed valid portfolio tool output", () => {
    const visualization = resolveSupplierPortfolioVisualization(
      suppliers,
      "bubble",
      "Quantitative comparison",
    );
    const messages = [
      {
        id: "assistant-1",
        role: "assistant",
        parts: [
          {
            type: "tool-renderSupplierPortfolio",
            toolCallId: "call-1",
            state: "output-available",
            input: { preferredView: "bubble", reason: "Quantitative comparison" },
            output: visualization,
          },
        ],
      },
    ] as unknown as UIMessage[];

    expect(getMessagePortfolioVisualization(messages)).toEqual(visualization);
  });

  it("ignores streaming, failed, and malformed portfolio tool output", () => {
    const messages = [
      {
        id: "assistant-1",
        role: "assistant",
        parts: [
          {
            type: "tool-renderSupplierPortfolio",
            toolCallId: "call-1",
            state: "input-streaming",
            input: { preferredView: "bubble" },
          },
          {
            type: "tool-renderSupplierPortfolio",
            toolCallId: "call-2",
            state: "output-error",
            input: { preferredView: "bubble", reason: "Plot" },
            errorText: "Invalid data",
          },
          {
            type: "tool-renderSupplierPortfolio",
            toolCallId: "call-3",
            state: "output-available",
            input: { preferredView: "bubble", reason: "Plot" },
            output: { view: "bubble", suppliers: [{ supplier: "Invented" }] },
          },
        ],
      },
    ] as unknown as UIMessage[];

    expect(getMessagePortfolioVisualization(messages)).toBeUndefined();
  });
});
