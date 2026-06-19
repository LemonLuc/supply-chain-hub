import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
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

function mockChatStreamWithReasoning() {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute: ({ writer }) => {
          writer.write({ type: "reasoning-start", id: "reasoning-1" });
          writer.write({
            type: "reasoning-delta",
            id: "reasoning-1",
            delta: "Checked authorized workflow context and source filters.",
          });
          writer.write({ type: "reasoning-end", id: "reasoning-1" });
          writer.write({ type: "text-start", id: "answer-1" });
          writer.write({
            type: "text-delta",
            id: "answer-1",
            delta: "DHL Freight shipment 00340434161094000012 is the first risk to handle.",
          });
          writer.write({ type: "text-end", id: "answer-1" });
        },
      }),
    }),
  );
}

function mockChatStreamWithMarkdownTable() {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute: ({ writer }) => {
          writer.write({ type: "text-start", id: "answer-1" });
          writer.write({
            type: "text-delta",
            id: "answer-1",
            delta: [
              "### Shipment options",
              "",
              "| Carrier | ETA | Status |",
              "| --- | --- | --- |",
              "| DHL Freight | 25 June | Attention |",
              "| FedEx | 23 June | On schedule |",
            ].join("\n"),
          });
          writer.write({ type: "text-end", id: "answer-1" });
        },
      }),
    }),
  );
}

describe("SupplyChainApp", () => {
  it("shows the demo access switch and uses the AI mark in the sidebar", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.getByLabelText("Demo identity")).toHaveValue("logistics");
    expect(screen.getByText("Lukas Weber")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Lukas Weber avatar" })).toHaveAttribute("src", "/avatars/lukas-weber.png");
    expect(screen.queryByText("LW")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Supply Chain Hub AI mark")).toHaveLength(2);
    expect(document.querySelectorAll(".ai-mark svg")).toHaveLength(2);
    expect(screen.queryByText("SH")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), { target: { value: "procurement" } });
    expect(screen.getByText("Dana Narid")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Dana Narid avatar" })).toHaveAttribute("src", "/avatars/dana-narid.png");
    expect(screen.queryByText("DN")).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("Signed-in user")).getByText("Procurement Team Lead")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Logistics Planner" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Procurement Team Lead" })).toBeInTheDocument();
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

  it("does not show the simulated process summary after prompting", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByText("Analysis trace")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Is there any delivery risk this week/i }));

    await waitFor(() => expect(screen.getByText("Delivery exception found")).toBeInTheDocument());
    expect(screen.queryByText("Analysis trace")).not.toBeInTheDocument();
    expect(screen.queryByText("Understand request")).not.toBeInTheDocument();
    expect(screen.queryByText("Check access")).not.toBeInTheDocument();
    expect(screen.queryByText("Validate evidence")).not.toBeInTheDocument();
    expect(screen.queryByText(/Simulated process summary/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/does not expose private model chain-of-thought/i)).not.toBeInTheDocument();
  });

  it("auto-collapses finished API reasoning and allows reopening it", async () => {
    mockChatStreamWithReasoning();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Is there any delivery risk this week/i }));

    const toggle = await screen.findByRole("button", { name: "Show reasoning" });
    expect(screen.getByText("DHL Freight shipment 00340434161094000012 is the first risk to handle.")).toBeInTheDocument();
    expect(screen.queryByText("Checked authorized workflow context and source filters.")).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Hide reasoning" })).toBeInTheDocument();
    expect(screen.getByText("Checked authorized workflow context and source filters.")).toBeInTheDocument();
  });

  it("does not show a reasoning panel when the API does not stream reasoning", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Is there any delivery risk this week/i }));

    await screen.findByRole("table");
    expect(screen.queryByRole("button", { name: "Show reasoning" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hide reasoning" })).not.toBeInTheDocument();
    expect(screen.queryByText("Traceability process")).not.toBeInTheDocument();
  });

  it("renders assistant markdown tables as table markup", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Is there any delivery risk this week/i }));

    const table = await screen.findByRole("table");
    expect(table).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Shipment options" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Carrier" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "DHL Freight" })).toBeInTheDocument();
    expect(screen.queryByText("| Carrier | ETA | Status |")).not.toBeInTheDocument();
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

  it("does not show deselected source evidence in the results panel", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByLabelText("DHL Freight"));
    fireEvent.click(screen.getByRole("button", { name: /Is there any delivery risk this week/i }));

    const results = await screen.findByLabelText("Supply Chain Hub results");
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

    expect(requestBody.selectedSourceIds).not.toContain("dhl");
    expect(within(results).queryByText(/DHL Freight/i)).not.toBeInTheDocument();
    expect(within(results).queryByText(/00340434161094000012/i)).not.toBeInTheDocument();
    expect(within(results).queryByText(/PO 4500872319/i)).not.toBeInTheDocument();
    expect(within(results).getAllByText(/FedEx Priority/i).length).toBeGreaterThan(0);
  });
});
