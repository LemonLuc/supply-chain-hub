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
  it("defaults to light mode and lets users toggle dark mode", () => {
    const { container } = render(<SupplyChainApp currentUser={mockUsers.logistics} />);
    const shell = container.querySelector(".app-shell");

    expect(shell).toHaveAttribute("data-theme", "light");
    expect(screen.getByRole("switch", { name: "Switch to dark mode" })).not.toHaveAttribute("title");

    fireEvent.click(screen.getByRole("switch", { name: "Switch to dark mode" }));

    expect(shell).toHaveAttribute("data-theme", "dark");
    expect(screen.getByRole("switch", { name: "Switch to light mode" })).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("switch", { name: "Switch to light mode" }));

    expect(shell).toHaveAttribute("data-theme", "light");
  });

  it("shows the demo access switch and signed-in user in the top-right header", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.getByLabelText("Demo identity")).toHaveValue("logistics");
    expect(within(screen.getByLabelText("User and role controls")).getByText("Lukas Weber")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Lukas Weber avatar" })).toHaveAttribute("src", "/avatars/lukas-weber.png");
    expect(screen.queryByText("LW")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Supply Chain Hub AI mark")).toHaveLength(1);
    expect(document.querySelectorAll(".ai-mark svg")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Ask Supply Chain Hub" })).toBeInTheDocument();
    expect(screen.getByLabelText("Supply Chain Hub AI mark").closest(".app-title")).not.toBeNull();
    expect(screen.queryByText("SH")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Supply chain workflows" })).not.toBeInTheDocument();
    expect(screen.queryByText("Intranet operations")).not.toBeInTheDocument();
    expect(screen.queryByText("Role-scoped console")).not.toBeInTheDocument();
    expect(screen.queryByText(/Ask across the sources authorized/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Supply Chain Hub resolves each prompt/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Supply Chain Hub AI mark").compareDocumentPosition(screen.getByLabelText("User and role controls"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.queryByText(/authorized data domains?/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Authenticated intranet session")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), { target: { value: "procurement" } });
    expect(screen.getByText("Dana Narid")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Dana Narid avatar" })).toHaveAttribute("src", "/avatars/dana-narid.png");
    expect(screen.queryByText("DN")).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("Signed-in user")).getByText("Procurement Team Lead")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Logistics Planner" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Procurement Team Lead" })).toBeInTheDocument();
  });

  it("keeps the weekly risk radar operational and hides the empty placeholder until data exists", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByRole("heading", { name: "Before" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "With Supply Chain Hub" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Ask a question to retrieve authorized live data/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("No analysis yet")).not.toBeInTheDocument();
    expect(screen.queryByText("Delivery exception found")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    await waitFor(() => expect(screen.getByText("Delivery exception found")).toBeInTheDocument());
    expect(screen.getByText(/DHL Freight shipment 00340434161094000012/i)).toBeInTheDocument();
    expect(screen.queryByText("Agent activity")).not.toBeInTheDocument();
    const chatPanel = screen.getByLabelText("Ask Supply Chain Hub");
    expect(within(chatPanel).getByRole("button", { name: /Open action menu/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Draft email to DHL Freight/i })).not.toBeInTheDocument();

    fireEvent.click(within(chatPanel).getByRole("button", { name: /Open action menu/i }));

    expect(within(chatPanel).getByRole("button", { name: /Draft email to DHL Freight/i })).toBeInTheDocument();
    expect(within(chatPanel).getByRole("button", { name: /Update SAP promised date/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Review Supplier Risk & Capacity Register.xlsx and show me recent changes/i })).toBeInTheDocument();
  });

  it("keeps suggested prompt templates in place after an example prompt runs", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    await waitFor(() => expect(screen.getByText("Delivery exception found")).toBeInTheDocument());
    const suggestions = screen.getByLabelText("Suggested questions");
    const messages = screen.getByLabelText("Chat messages");

    expect(suggestions.compareDocumentPosition(messages) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("never shows financial values or quantified business risk to logistics planners", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByText(/€/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Revenue at risk/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Impact" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));
    await waitFor(() => expect(screen.getByText("Delivery exception found")).toBeInTheDocument());

    expect(screen.queryByText(/€/)).not.toBeInTheDocument();
    expect(screen.queryByText(/financial exposure/i)).not.toBeInTheDocument();
  });

  it("removes workflow navigation and limits logistics planners to their authorized source set", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByRole("button", { name: /Supplier alternatives/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Executive supplier portfolio/i })).not.toBeInTheDocument();
    expect(screen.getByText("4 / 6 data sources selected")).toBeInTheDocument();
    expect(screen.queryByText(/Risk radar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tool access/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Choose authorized sources" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "SELECT TOOLS" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("SAP S/4HANA")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByText("Configure tools once, then reselect later when the workflow changes.")).toBeInTheDocument();
    expect(screen.getByLabelText("SAP S/4HANA")).toBeChecked();
    expect(screen.getByLabelText("DHL Freight")).toBeChecked();
    expect(screen.queryByLabelText("Supplier qualification database")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Contract repository")).not.toBeInTheDocument();
  });

  it("shows procurement sources without workflow navigation and routes alternate prompts to the right data", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.procurement} />);

    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    expect(screen.getAllByLabelText("SAP S/4HANA").some((input) => input instanceof HTMLInputElement && input.checked)).toBe(true);
    expect(screen.getByLabelText("Supplier qualification database")).toBeChecked();
    expect(screen.queryByRole("button", { name: /Executive supplier portfolio/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /What approved alternates can cover the delayed turret assemblies/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(requestBody.workflowKey).toBe("delay");
    expect(requestBody.selectedSourceIds).toEqual(["sap", "quality", "excel", "capacity", "outlook"]);
  });

  it("reveals the executive heat map from merged executive sources only after a prompt", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.executive} />);

    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    expect(screen.getByLabelText("DHL Freight")).toBeChecked();
    expect(screen.getByLabelText("Supplier qualification database")).toBeChecked();
    expect(screen.getByLabelText("Contract repository")).toBeChecked();
    expect(screen.queryByText("Supplier portfolio heat map")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Show supplier consolidation options/i }));

    await waitFor(() => expect(screen.getByText("Supplier portfolio heat map")).toBeInTheDocument());
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(requestBody.workflowKey).toBe("consolidate");
    expect(requestBody.selectedSourceIds).toEqual(["sap", "contracts", "quality", "resilience", "policy"]);
    fireEvent.click(screen.getByRole("button", { name: /Open action menu/i }));
    expect(screen.getByText("C-level approval required")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Request executive review/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Terminate contract now/i })).not.toBeInTheDocument();
  });

  it("routes the CEO workbook review prompt with the selected SharePoint source", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.executive} />);

    fireEvent.click(screen.getByRole("button", { name: /Review Supplier Risk & Capacity Register.xlsx and show me recent changes/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(requestBody.workflowKey).toBe("delay");
    expect(requestBody.demoPersona).toBe("executive");
    expect(requestBody.selectedSourceIds).toEqual(["sap", "quality", "excel", "capacity", "outlook"]);
  });

  it("does not show the simulated process summary after prompting", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByText("Analysis trace")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

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

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    const toggle = await screen.findByRole("button", { name: "Show reasoning" });
    expect(screen.getByText("DHL Freight shipment 00340434161094000012 is the first risk to handle.")).toBeInTheDocument();
    expect(screen.queryByText("Checked authorized workflow context and source filters.")).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Hide reasoning" })).toBeInTheDocument();
    expect(screen.getByText("Checked authorized workflow context and source filters.")).toBeInTheDocument();
  });

  it("always shows fallback reasoning when the API does not stream reasoning", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    await screen.findByRole("table");
    expect(screen.getByRole("button", { name: "Hide reasoning" })).toBeInTheDocument();
    expect(screen.getByText("Checked role permissions, selected tools, retrieved grounded records, and prepared the response summary.")).toBeInTheDocument();
    expect(screen.queryByText("Traceability process")).not.toBeInTheDocument();
  });

  it("renders assistant markdown tables as table markup", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

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

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(requestBody.selectedSourceIds).toEqual(["sap", "dhl", "fedex", "warehouse"]);
    expect(requestBody.selectedSourceIds).not.toContain("ups");
  });

  it("does not show deselected source evidence in the results panel", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    fireEvent.click(screen.getByLabelText("DHL Freight"));

    expect(screen.getByText("3 / 6 data sources selected")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    const results = await screen.findByLabelText("Supply Chain Hub results");
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

    expect(requestBody.selectedSourceIds).not.toContain("dhl");
    expect(within(results).queryByText(/DHL Freight/i)).not.toBeInTheDocument();
    expect(within(results).queryByText(/00340434161094000012/i)).not.toBeInTheDocument();
    expect(within(results).queryByText(/PO 4500872319/i)).not.toBeInTheDocument();
    expect(within(results).getAllByText(/FedEx Priority/i).length).toBeGreaterThan(0);
  });

  it("routes operational draft approvals from logistics to Dana and returns the decision to the requester", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));
    await waitFor(() => expect(screen.getByText("Delivery exception found")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /Open action menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /Notify logistics team lead/i }));

    expect(screen.getByText(/Approval request sent to Dana Narid/i)).toBeInTheDocument();
    expect(screen.getByText("Submitted requests")).toBeInTheDocument();
    expect(screen.getByText("Pending review by Dana Narid")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approve Notify logistics team lead/i })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), { target: { value: "procurement" } });

    expect(screen.getByText("Approval queue")).toBeInTheDocument();
    expect(screen.getByText("From Lukas Weber")).toBeInTheDocument();
    expect(screen.getByText(/DHL Freight shipment 00340434161094000012/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Approve Notify logistics team lead/i }));

    expect(screen.getByText("Approved by Dana Narid")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), { target: { value: "logistics" } });

    expect(screen.getByText("Submitted requests")).toBeInTheDocument();
    expect(screen.getByText("Approved by Dana Narid")).toBeInTheDocument();
  });

  it("routes executive review requests to Lucía with approve and deny controls", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.executive} />);

    fireEvent.click(screen.getByRole("button", { name: /Show supplier consolidation options/i }));
    await waitFor(() => expect(screen.getByText("Supplier portfolio heat map")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /Open action menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /Request executive review/i }));

    expect(screen.getByText("Approval queue")).toBeInTheDocument();
    expect(screen.getByText("Pending review by Dr. Lucía López")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Approve Request executive review/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Deny Request executive review/i })).toBeInTheDocument();
  });
});
