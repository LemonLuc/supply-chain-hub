import { render, screen } from "@testing-library/react";
import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";

import {
  getMessagePortfolioVisualization,
  SupplierPortfolioVisualizationView,
} from "./supplier-portfolio-visualization";
import {
  resolveSupplierPortfolioVisualization,
} from "@/lib/supplier-portfolio";
import { workflows } from "@/lib/demo-data";

const suppliers = workflows.consolidate.heatMap ?? [];

describe("SupplierPortfolioVisualizationView", () => {
  it("renders suppliers in a savings and strategic relationship matrix", () => {
    const visualization = resolveSupplierPortfolioVisualization(
      suppliers,
      "matrix",
      "Categorical comparison",
    );

    render(<SupplierPortfolioVisualizationView visualization={visualization} />);

    expect(
      screen.getByRole("table", { name: /supplier savings and strategic relationship matrix/i }),
    ).toBeInTheDocument();
    const steripack = screen.getByText("Steripack Hohenlohe");
    expect(steripack.closest("td")).toHaveAttribute("data-savings", "Medium");
    expect(steripack.closest("td")).toHaveAttribute("data-relationship", "Medium");
    expect(steripack.closest(".supplier-marker")).toHaveTextContent("€520K");
    expect(screen.getByText("Shift volume to MediSeal Jena")).toBeInTheDocument();
    expect(screen.getAllByText("Strategic trade-off").length).toBeGreaterThan(0);
    for (const supplierName of ["Kappel Pack", "BracketPro Ulm"]) {
      const supplier = screen.getByText(supplierName);
      expect(supplier.closest("td")).toHaveAttribute("data-savings", "Low");
      expect(supplier.closest("td")).toHaveAttribute("data-relationship", "Medium");
      expect(supplier.closest(".supplier-marker")).toHaveClass("decision-low-priority");
    }
    expect(screen.getAllByText("Low priority")).toHaveLength(3);
    expect(screen.getByRole("list", { name: /decision heat legend/i })).toHaveTextContent(
      "KeepConsolidateStrategic trade-offLow priority",
    );
  });

  it("renders a savings and relationship bubble chart with annual cost amounts inside", () => {
    const visualization = resolveSupplierPortfolioVisualization(
      suppliers,
      "bubble",
      "Quantitative comparison",
    );

    const { container } = render(
      <SupplierPortfolioVisualizationView visualization={visualization} />,
    );

    expect(
      screen.getByRole("img", { name: /supplier savings and strategic relationship map/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Annual consolidation savings (EUR)")).toBeInTheDocument();
    expect(screen.getByText("Strategic relationship score (0–100)")).toBeInTheDocument();
    expect(screen.getByText("€4.6M")).toHaveClass("portfolio-bubble-cost");
    expect(screen.getByText("€800K")).toHaveClass("portfolio-bubble-cost", "is-compact");
    expect(document.body).not.toHaveTextContent("$");
    expect(screen.queryByText(/annual cost/i)).not.toBeInTheDocument();
    expect(screen.getByText("MediSeal Jena")).toHaveAttribute("text-anchor", "middle");
    expect(screen.getByText(/reliability, quality, qualification depth/i)).toBeInTheDocument();
    for (const bubble of container.querySelectorAll<SVGGElement>(".portfolio-bubble")) {
      const circle = bubble.querySelector("circle");
      const value = bubble.querySelector<SVGTextElement>(".portfolio-bubble-cost");
      const radius = Number(circle?.getAttribute("r"));
      const textLength = Number(value?.getAttribute("textLength"));

      expect(textLength).toBeGreaterThan(0);
      expect(textLength).toBeLessThanOrEqual(radius * 2 - 10);
      expect(value).toHaveAttribute("lengthAdjust", "spacingAndGlyphs");
    }
    expect(screen.getByRole("list", { name: /decision heat legend/i })).toHaveTextContent(
      "KeepConsolidateStrategic trade-offLow priority",
    );
    expect(screen.queryByText("Quantitative comparison")).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      [...container.querySelectorAll(".portfolio-chart-zones rect")].map((zone) =>
        zone.getAttribute("class"),
      ),
    ).toEqual([
      "zone-keep",
      "zone-strategic-trade-off",
      "zone-low-priority",
      "zone-consolidate",
    ]);
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

  it("does not reuse a portfolio choice from an older assistant response", () => {
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
      {
        id: "user-2",
        role: "user",
        parts: [{ type: "text", text: "Show the matrix instead." }],
      },
      {
        id: "assistant-2",
        role: "assistant",
        parts: [{ type: "text", text: "Using the categorical view." }],
      },
    ] as unknown as UIMessage[];

    expect(getMessagePortfolioVisualization(messages)).toBeUndefined();
  });
});
