import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SupplyChainApp } from "./supply-chain-app";

describe("SupplyChainApp", () => {
  it("renders the context-aware chat controls above the dashboard", () => {
    render(<SupplyChainApp />);

    expect(screen.getByRole("heading", { name: "Chat with this workspace" })).toBeInTheDocument();
    expect(screen.getByLabelText("Model")).toHaveValue("gpt-5.4-mini");
    expect(screen.getByLabelText("Thinking level")).toHaveValue("medium");
    expect(screen.getByPlaceholderText("Ask about suppliers, risks, scenarios, or recommendations")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Three suppliers need attention this week." })).toBeInTheDocument();
  });

  it("updates both the dashboard and chat context when a workflow is selected", () => {
    render(<SupplyChainApp />);

    fireEvent.click(screen.getByRole("button", { name: /Supplier A delay/i }));

    expect(
      screen.getByRole("heading", { name: "What happens if Supplier A is delayed by 2 weeks?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Context: Supplier A delay")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A 2-week Supplier A delay creates a week-3 production gap." })).toBeInTheDocument();
  });
});
