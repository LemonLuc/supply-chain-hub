import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mockUsers } from "@/lib/auth";

import { SupplyChainApp } from "./supply-chain-app";

afterEach(() => {
  vi.restoreAllMocks();
});

function mockChatStream() {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("data: [DONE]\n\n", {
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    }),
  );
}

describe("SupplyChainApp", () => {
  it("shows the demo access switch and uses the AI mark in the sidebar", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.getByLabelText("Demo identity")).toHaveValue("logistics");
    expect(screen.getByText("Lukas Weber")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Supply Chain Hub AI mark")).toHaveLength(2);
    expect(document.querySelectorAll(".ai-mark svg")).toHaveLength(2);
    expect(screen.queryByText("SH")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), { target: { value: "procurement" } });
    expect(screen.getByText("Anna Keller")).toBeInTheDocument();
    expect(screen.getByText("Procurement Team Lead")).toBeInTheDocument();
  });

  it("keeps the weekly risk radar operational and hides results until a prompt runs", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByRole("heading", { name: "Before" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "With Supply Chain Hub" })).not.toBeInTheDocument();
    expect(screen.getByText(/Ask a question to retrieve authorized live data/i)).toBeInTheDocument();
    expect(screen.queryByText("Delivery exception found")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Is there any delivery risk this week/i }));

    await waitFor(() => expect(screen.getByText("Delivery exception found")).toBeInTheDocument());
    expect(screen.getByText(/DHL Freight shipment 00340434161094000012/i)).toBeInTheDocument();
    expect(screen.getByText("Agent activity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Draft email to DHL Freight/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Update SAP promised date/i })).toBeInTheDocument();
  });

  it("never shows financial values or quantified business risk to logistics planners", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByText(/€/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Revenue at risk/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Impact" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Is there any delivery risk this week/i }));
    await waitFor(() => expect(screen.getByText("Delivery exception found")).toBeInTheDocument());

    expect(screen.queryByText(/€/)).not.toBeInTheDocument();
    expect(screen.queryByText(/financial exposure/i)).not.toBeInTheDocument();
  });

  it("locks supplier alternatives and executive optimization for logistics planners", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.getByRole("button", { name: /Supplier alternatives/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Executive supplier portfolio/i })).toBeDisabled();
  });

  it("unlocks procurement workflows and shows source authorization controls", () => {
    render(<SupplyChainApp currentUser={mockUsers.procurement} />);

    fireEvent.click(screen.getByRole("button", { name: /Supplier alternatives/i }));
    expect(screen.getByRole("heading", { name: /What are our approved alternatives/i })).toBeInTheDocument();
    expect(screen.getByLabelText("SAP S/4HANA")).toBeChecked();
    expect(screen.getByLabelText("Supplier qualification database")).toBeChecked();

    expect(screen.getByRole("button", { name: /Executive supplier portfolio/i })).toBeDisabled();
  });

  it("reveals the executive heat map and human approval gate only after a prompt", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.executive} />);

    fireEvent.click(screen.getByRole("button", { name: /Executive supplier portfolio/i }));
    expect(screen.queryByText("Supplier portfolio heat map")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Give me a heat map/i }));

    await waitFor(() => expect(screen.getByText("Supplier portfolio heat map")).toBeInTheDocument());
    expect(screen.getByText("C-level approval required")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Request executive review/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Terminate contract now/i })).not.toBeInTheDocument();
  });

  it("shows a safe simulated analysis trace only after prompting", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByText("Analysis trace")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Is there any delivery risk this week/i }));

    await waitFor(() => expect(screen.getByText("Analysis trace")).toBeInTheDocument());
    expect(screen.getByText("Understand request")).toBeInTheDocument();
    expect(screen.getByText("Check access")).toBeInTheDocument();
    expect(screen.getByText("Validate evidence")).toBeInTheDocument();
    expect(screen.getByText(/Simulated process summary/i)).toBeInTheDocument();
    expect(screen.getByText(/does not expose private model chain-of-thought/i)).toBeInTheDocument();
  });

  it("sends only the selected source ids with the chat request", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Is there any delivery risk this week/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(requestBody.selectedSourceIds).toEqual(["sap", "dhl", "fedex", "warehouse"]);
    expect(requestBody.selectedSourceIds).not.toContain("ups");
  });
});
