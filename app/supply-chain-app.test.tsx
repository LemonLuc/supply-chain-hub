import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mockUsers } from "@/lib/auth";

import { SupplyChainApp } from "./supply-chain-app";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SupplyChainApp", () => {
  it("renders the signed-in identity and Supply Chain Hub controls", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.getByText("Lukas Weber")).toBeInTheDocument();
    expect(screen.getByText("Logistics Planner")).toBeInTheDocument();
    expect(screen.queryByLabelText("Persona")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ask Supply Chain Hub" })).toBeInTheDocument();
    expect(screen.getByLabelText("Model")).toHaveValue("gpt-5.4-mini");
    expect(screen.getByLabelText("Thinking level")).toHaveValue("medium");
    expect(screen.getByPlaceholderText("Ask about suppliers, risks, scenarios, or recommendations")).toBeInTheDocument();
  });

  it("shows the before and integrated weekly risk workflow", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.getByRole("heading", { name: "Before" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "With Supply Chain Hub" })).toBeInTheDocument();
    expect(screen.getByText(/Planner checks SAP open purchase orders/i)).toBeInTheDocument();
    expect(screen.getByText("SAP S/4HANA")).toBeInTheDocument();
    expect(screen.getByText(/6 connected sources/i)).toBeInTheDocument();
  });

  it("switches between the 14-day delay and procurement guardrail workflows", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /14-day supplier delay/i }));
    expect(screen.getByRole("heading", { name: /Supplier A slips by 14 days/i })).toBeInTheDocument();
    expect(screen.getByText(/retrieves BOM where-used/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Procurement optimization/i }));
    expect(screen.getByRole("heading", { name: /Where can we consolidate spend/i })).toBeInTheDocument();
    expect(screen.getByText(/Guardrails preserve critical redundancy/i)).toBeInTheDocument();
  });

  it("derives supplier impact visibility from the signed-in user", () => {
    const { unmount } = render(<SupplyChainApp currentUser={mockUsers.logistics} />);
    expect(screen.queryByRole("columnheader", { name: "Impact" })).not.toBeInTheDocument();
    unmount();

    render(<SupplyChainApp currentUser={mockUsers.procurement} />);
    expect(screen.getByRole("columnheader", { name: "Impact" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "€1.6M revenue at risk" })).toBeInTheDocument();
  });

  it("removes presentation-only sections and old product language", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByText("Talk track")).not.toBeInTheDocument();
    expect(screen.queryByText("Demo prompts")).not.toBeInTheDocument();
    expect(screen.queryByText("Copilot")).not.toBeInTheDocument();
  });

  it("does not send persona data from the browser", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("data: [DONE]\n\n", {
        headers: {
          "content-type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
        },
      }),
    );
    render(<SupplyChainApp currentUser={mockUsers.procurement} />);

    fireEvent.click(screen.getByRole("button", { name: "Which supplier needs action today?" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(requestBody).not.toHaveProperty("persona");
  });
});
