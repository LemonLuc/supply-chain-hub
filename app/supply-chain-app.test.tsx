import { readFileSync } from "node:fs";

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mockUsers } from "@/lib/auth";
import { workflows } from "@/lib/demo-data";
import { resolveSupplierPortfolioVisualization } from "@/lib/supplier-portfolio";

import { SupplyChainApp } from "./supply-chain-app";

const originalClipboard = navigator.clipboard;

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: originalClipboard,
  });
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

function createPortfolioToolResponse(view: "matrix" | "bubble") {
  const suppliers = workflows.consolidate.heatMap ?? [];
  const visualization = resolveSupplierPortfolioVisualization(
    suppliers,
    view,
    view === "bubble" ? "Savings and relationship support a quantitative comparison." : "Decision bands support a compact matrix.",
  );

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({
          type: "tool-input-available",
          toolCallId: "portfolio-view-1",
          toolName: "renderSupplierPortfolio",
          input: { preferredView: view, reason: visualization.reason },
        });
        writer.write({
          type: "tool-output-available",
          toolCallId: "portfolio-view-1",
          output: visualization,
        });
        writer.write({ type: "text-start", id: "answer-1" });
        writer.write({
          type: "text-delta",
          id: "answer-1",
          delta: "The portfolio view reflects the available savings and strategic relationship evidence.",
        });
        writer.write({ type: "text-end", id: "answer-1" });
      },
    }),
  });
}

function mockChatAndActionStream(
  actionResponse?: Record<string, unknown>,
  chatView?: "matrix" | "bubble",
) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);

    if (url.includes("/api/actions")) {
      return Response.json(
        actionResponse ?? {
          actionLabel: "Write Dana Narid for review",
          recipientActionLabel: "Review delivery risk summary",
          reviewerPersona: "procurement",
          reviewerName: "Dana Narid",
          draft:
            "Write Dana Narid for review\n\nFrom Lukas Weber to Dana Narid.\n\nDHL Freight shipment 00340434161094000012 missed its Leipzig hub departure.",
          notice: "Approval request sent to Dana Narid.",
          orchestration: "agents-sdk",
          toolCalls: ["read_supply_chain_context", "prepare_action_workflow"],
        },
      );
    }

    if (chatView) return createPortfolioToolResponse(chatView);

    return new Response("data: [DONE]\n\n", {
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    });
  });
}

function mockChatAndRejectedActionStream() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);

    if (url.includes("/api/actions")) {
      return Response.json({ error: "Action unavailable" }, { status: 403 });
    }

    return new Response("data: [DONE]\n\n", {
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    });
  });
}

function mockChatAndPendingActionStream() {
  let resolveAction!: (response: Response) => void;
  const actionPromise = new Promise<Response>((resolve) => {
    resolveAction = resolve;
  });
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);

    if (url.includes("/api/actions")) return actionPromise;

    return new Response("data: [DONE]\n\n", {
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    });
  });

  return { fetchMock, resolveAction };
}

function mockPendingChatStream() {
  let resolveResponse!: (response: Response) => void;
  const responsePromise = new Promise<Response>((resolve) => {
    resolveResponse = resolve;
  });
  const fetchMock = vi.spyOn(globalThis, "fetch").mockReturnValue(responsePromise);

  return { fetchMock, resolveResponse };
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
              "| DHL Freight | 23 July | Attention |",
              "| FedEx | 21 July | On schedule |",
            ].join("\n"),
          });
          writer.write({ type: "text-end", id: "answer-1" });
        },
      }),
    }),
  );
}

function mockChatStreamWithPortfolioTool(view: "matrix" | "bubble") {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(createPortfolioToolResponse(view));
}

describe("SupplyChainApp", () => {
  it("uses the page scrollbar instead of a nested chat transcript scrollbar", () => {
    const css = readFileSync("app/globals.css", "utf8");
    const source = readFileSync("app/supply-chain-app.tsx", "utf8");
    const messageListRule = css.match(/\.message-list\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(messageListRule).not.toMatch(/max-height\s*:/);
    expect(messageListRule).not.toMatch(/overflow-y\s*:\s*auto/);
    expect(source).not.toContain("messageListRef");
    expect(source).not.toContain("followTranscriptRef");
    expect(source).not.toContain("forceTranscriptScrollRef");
  });

  it("keeps wide markdown tables inside the chat transcript", () => {
    const css = readFileSync("app/globals.css", "utf8");
    const messageListRule = css.match(/\.message-list\s*\{([^}]*)\}/)?.[1] ?? "";
    const messageRule = css.match(/\.message\s*\{([^}]*)\}/)?.[1] ?? "";
    const markdownRule = css.match(/\.markdown-content\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(messageListRule).toMatch(/grid-template-columns\s*:\s*minmax\(0,\s*1fr\)/);
    expect(messageRule).toMatch(/min-width\s*:\s*0/);
    expect(markdownRule).toMatch(/overflow-x\s*:\s*auto/);
  });

  it("defines semantic light and dark theme tokens without legacy heat cards", () => {
    const css = readFileSync("app/globals.css", "utf8");
    const themeLayer = css.slice(css.indexOf("/* Unified enterprise theme layer"));
    const lightTheme = themeLayer.match(/\.app-shell \{([\s\S]*?)\n\}/)?.[1] ?? "";
    const darkTheme = themeLayer.match(/\.app-shell\[data-theme="dark"\] \{([\s\S]*?)\n\}/)?.[1] ?? "";
    const requiredTokens = [
      "--decision-keep",
      "--decision-keep-fill",
      "--decision-consolidate",
      "--decision-consolidate-fill",
      "--decision-tradeoff",
      "--decision-tradeoff-fill",
      "--decision-low-priority",
      "--decision-low-priority-fill",
      "--protected-ink",
      "--protected-surface",
      "--success-surface",
      "--warning-surface",
      "--danger-surface",
    ];

    for (const token of requiredTokens) {
      expect(lightTheme).toContain(`${token}:`);
      expect(darkTheme).toContain(`${token}:`);
    }
    expect(themeLayer).toMatch(
      /\.results,\s*\.supplier-portfolio-section\s*\{[^}]*min-width:\s*0;/,
    );
    expect(themeLayer).toMatch(
      /\.results\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/,
    );
    expect(themeLayer).toMatch(
      /\.app-shell \.status-protected\s*\{[^}]*var\(--protected-ink\)[^}]*var\(--protected-surface\)/,
    );
    expect(themeLayer).toMatch(
      /\.portfolio-bubble-cost\s*\{[^}]*fill:\s*#111827;/,
    );
    expect(themeLayer).not.toContain(
      ".portfolio-bubble.decision-strategic-trade-off .portfolio-bubble-cost",
    );
    expect(css).not.toContain(".heat-cell");
  });

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
    expect(document.querySelector(".theme-switch-thumb svg")).not.toBeNull();
  });

  it("shows the demo access switch and signed-in user in the top-right header", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.getAllByText(/Oberkochen HQ/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText("Demo identity")).toHaveValue("logistics");
    expect(within(screen.getByLabelText("User and role controls")).getByText("Lukas Weber")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Lukas Weber avatar" })).toHaveAttribute("src", "/avatars/lukas-weber.png");
    expect(screen.queryByText("LW")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Supply Chain Hub AI mark")).toHaveLength(1);
    expect(document.querySelectorAll(".ai-mark svg")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Ask Supply Chain Hub" })).toBeInTheDocument();
    expect(screen.queryByText("News of the Day")).not.toBeInTheDocument();
    const recommendations = screen.getByLabelText("Recommended for you");
    expect(within(recommendations).getByRole("heading", { name: "Recommended for you" })).toBeInTheDocument();
    expect(within(recommendations).queryByText("Based on Oberkochen HQ priorities")).not.toBeInTheDocument();
    expect(within(recommendations).getByRole("button", { name: /Open DHL tracking delay/i })).toBeInTheDocument();
    expect(within(recommendations).getAllByRole("button")).toHaveLength(3);
    fireEvent.click(within(recommendations).getByRole("button", { name: /Open DHL tracking delay/i }));
    expect(within(recommendations).getByText("Opened Shipping providers in a new tab.")).toBeInTheDocument();
    expect(within(recommendations).getByRole("button", { name: "Go to Shipping providers" })).toBeInTheDocument();
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
    expect(screen.getByText(/MT-440B alternate reservation/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Lukas/i })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Dana Narid avatar" })).toHaveAttribute("src", "/avatars/dana-narid.png");
    expect(screen.queryByText("DN")).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("Signed-in user")).getByText("Procurement Team Lead")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Logistics Planner" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Procurement Team Lead" })).toBeInTheDocument();
  });

  it("does not populate findings while a prompt is still being processed", async () => {
    const { fetchMock, resolveResponse } = mockPendingChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(screen.getByText(/Connecting to authorized tools/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Supply Chain Hub results")).not.toBeInTheDocument();
    expect(screen.queryByText("Findings")).not.toBeInTheDocument();

    resolveResponse(
      new Response("data: [DONE]\n\n", {
        headers: {
          "content-type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
        },
      }),
    );

    expect(await screen.findAllByText(/PO 4500872319/i)).not.toHaveLength(0);
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

    expect(await screen.findAllByText(/PO 4500872319/i)).not.toHaveLength(0);
    expect(screen.getByText(/480 N-FK5 optical glass blanks/i)).toBeInTheDocument();
    expect(screen.queryByText("Agent activity")).not.toBeInTheDocument();
    const chatPanel = screen.getByLabelText("Ask Supply Chain Hub");
    expect(within(chatPanel).getByRole("button", { name: /Close actions/i })).toBeInTheDocument();
    expect(within(chatPanel).getByRole("button", { name: /Request DHL recovery routing/i })).toBeInTheDocument();
    expect(within(chatPanel).getByRole("button", { name: /Write Dana Narid for review/i })).toBeInTheDocument();
    expect(within(chatPanel).getByRole("button", { name: /Log DHL exception on PO 4500872319/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Show me potential delivery risks/i })).toHaveLength(1);
  });

  it("keeps suggested prompt templates in place after an example prompt runs", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    await screen.findByLabelText("Chat messages");
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
    expect(await screen.findAllByText(/PO 4500872319/i)).not.toHaveLength(0);

    expect(screen.queryByText(/€/)).not.toBeInTheDocument();
    expect(screen.queryByText(/financial exposure/i)).not.toBeInTheDocument();
  });

  it("removes workflow navigation and limits logistics planners to their authorized source set", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByRole("button", { name: /Supplier alternatives/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Executive supplier portfolio/i })).not.toBeInTheDocument();
    expect(screen.getByText("6 / 6 data sources selected")).toBeInTheDocument();
    expect(screen.queryByText(/Risk radar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tool access/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Choose authorized sources" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "SELECT TOOLS" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("SAP S/4HANA")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByText("Configure tools once, then reselect later when the workflow changes.")).toBeInTheDocument();
    expect(screen.getByLabelText("SAP S/4HANA")).toBeChecked();
    expect(screen.getByLabelText("Shipping providers")).toBeChecked();
    expect(screen.queryByLabelText("Supplier qualification database")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Contract repository")).not.toBeInTheDocument();
  });

  it("defaults to GPT-5.6 Sol with high reasoning and offers only GPT-5.6 choices", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    const modelSelect = screen.getByLabelText("Model") as HTMLSelectElement;
    const thinkingSelect = screen.getByLabelText("Thinking level") as HTMLSelectElement;

    expect(modelSelect).toHaveValue("gpt-5.6-sol");
    expect(within(modelSelect).getAllByRole("option").map((option) => (option as HTMLOptionElement).value)).toEqual([
      "gpt-5.6-sol",
      "gpt-5.6-terra",
      "gpt-5.6-luna",
    ]);
    expect(thinkingSelect).toHaveValue("high");
    expect(within(thinkingSelect).getAllByRole("option").map((option) => (option as HTMLOptionElement).value)).toEqual([
      "none",
      "low",
      "medium",
      "high",
      "xhigh",
      "max",
    ]);
  });

  it("sends Sol with high reasoning when the user keeps the defaults", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      workflowKey: "risks",
      model: "gpt-5.6-sol",
      thinking: "high",
    });
  });

  it("collapses chat settings when switching demo persona", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), { target: { value: "procurement" } });

    expect(screen.queryByRole("heading", { name: "Settings" })).not.toBeInTheDocument();
  });

  it("shows procurement sources without workflow navigation and routes alternate prompts to the right data", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.procurement} />);

    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    expect(screen.getByLabelText("SAP S/4HANA")).toBeChecked();
    expect(screen.getByLabelText("Supplier qualification database")).toBeChecked();
    expect(screen.queryByRole("button", { name: /Executive supplier portfolio/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /What approved alternates can cover the delayed turret assemblies/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(requestBody.workflowKey).toBe("delay");
    expect(requestBody.selectedSourceIds).toEqual(["sap", "quality", "excel", "capacity", "outlook", "teams"]);
    expect(screen.queryByRole("button", { name: /Share risk register with Lukas/i })).not.toBeInTheDocument();
  });

  it("keeps a contextual visualize-this follow-up on the active workflow", async () => {
    const fetchMock = mockChatAndActionStream();
    render(<SupplyChainApp currentUser={mockUsers.procurement} />);

    fireEvent.click(screen.getByRole("button", {
      name: /What approved alternates can cover the delayed turret assemblies/i,
    }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Visualize this." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const followUpBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(followUpBody.workflowKey).toBe("delay");
    expect(followUpBody.selectedSourceIds).toEqual([
      "sap",
      "quality",
      "excel",
      "capacity",
      "outlook",
      "teams",
    ]);
  });

  it("applies the Microsoft 365 Suite selection to every procurement workflow", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.procurement} />);

    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    expect(screen.getAllByLabelText("SAP S/4HANA")).toHaveLength(1);
    expect(screen.getAllByLabelText("Microsoft 365 Suite")).toHaveLength(1);
    expect(screen.getByText("6 / 6 data sources selected")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Microsoft 365 Suite"));

    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Show me potential delivery risks for this week." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "What approved alternates can cover the delayed turret assemblies?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByLabelText("Microsoft 365 Suite"));
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "What approved alternates can cover the delayed turret assemblies?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    const bodies = fetchMock.mock.calls.map((call) => JSON.parse(String(call[1]?.body)));
    expect(bodies[0]).toMatchObject({ workflowKey: "risks" });
    expect(bodies[1]).toMatchObject({ workflowKey: "delay" });
    expect(bodies[2]).toMatchObject({ workflowKey: "delay" });
    expect(bodies[0].selectedSourceIds).toEqual(["sap", "carriers", "warehouse"]);
    expect(bodies[1].selectedSourceIds).toEqual(["sap", "quality", "capacity"]);
    expect(bodies[2].selectedSourceIds).toEqual(["sap", "quality", "excel", "capacity", "outlook", "teams"]);
  });

  it("groups Microsoft settings at each persona's authorization level", () => {
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);
    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));

    expect(screen.getByLabelText("Microsoft Outlook")).toBeChecked();
    expect(screen.getByLabelText("Microsoft SharePoint")).toBeChecked();
    expect(screen.getByLabelText("Microsoft Word")).toBeChecked();
    expect(screen.queryByLabelText("Microsoft 365 Suite")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), {
      target: { value: "procurement" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));

    expect(screen.getAllByLabelText("Microsoft 365 Suite")).toHaveLength(1);
    expect(screen.queryByLabelText("Microsoft Outlook")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Microsoft SharePoint")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Microsoft Word")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), {
      target: { value: "executive" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));

    expect(screen.getAllByLabelText("Microsoft 365 Suite")).toHaveLength(1);
    expect(screen.queryByLabelText("Microsoft Word")).not.toBeInTheDocument();
  });

  it("reveals the executive supplier matrix from merged executive sources only after a prompt", async () => {
    const fetchMock = mockChatStreamWithPortfolioTool("matrix");
    render(<SupplyChainApp currentUser={mockUsers.executive} />);

    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    expect(screen.getByLabelText("Contract repository")).toBeChecked();
    expect(screen.queryByLabelText("Shipping providers")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Supplier qualification database")).not.toBeInTheDocument();
    expect(screen.queryByText("Supplier savings–relationship matrix")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Show supplier consolidation options/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("table", { name: /supplier savings and strategic relationship matrix/i }),
      ).toBeInTheDocument(),
    );
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(requestBody.workflowKey).toBe("consolidate");
    expect(requestBody.selectedSourceIds).toEqual(["sap", "contracts", "quality", "resilience", "policy", "word"]);
    expect(screen.queryByText("C-level approval required")).not.toBeInTheDocument();
    expect(screen.getByText("Steripack Hohenlohe").closest(".supplier-marker")).toHaveClass("decision-strategic-trade-off");
    expect(screen.getByText("MediSeal Jena").closest(".supplier-marker")).toHaveClass("decision-keep");
    expect(screen.getByText("FlexPack Esslingen").closest(".supplier-marker")).toHaveClass("decision-consolidate");
    expect(screen.getByRole("button", { name: /Draft contract termination letter/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Request executive review/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Terminate contract now/i })).not.toBeInTheDocument();
  });

  it("uses the quantitative bubble chart for an explicit demo prompt", async () => {
    mockChatStreamWithPortfolioTool("bubble");
    render(<SupplyChainApp currentUser={mockUsers.executive} />);

    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Plot annual consolidation savings and strategic relationship score as a bubble chart." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() =>
      expect(
        screen.getByRole("img", { name: /supplier savings and strategic relationship map/i }),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByRole("table", { name: /supplier savings and strategic relationship matrix/i })).not.toBeInTheDocument();
  });

  it("prefers completed validated model tool output over the demo prompt fallback", async () => {
    mockChatStreamWithPortfolioTool("bubble");
    render(<SupplyChainApp currentUser={mockUsers.executive} />);

    fireEvent.click(screen.getByRole("button", { name: /Show supplier consolidation options/i }));

    const visual = await screen.findByRole("img", { name: /supplier savings and strategic relationship map/i });
    expect(visual.closest(".message.assistant")).not.toBeNull();
    expect(screen.getAllByRole("img", { name: /supplier savings and strategic relationship map/i })).toHaveLength(1);
    expect(screen.queryByText("Savings and relationship support a quantitative comparison.")).not.toBeInTheDocument();
  });

  it("keeps the executive prompts strategic", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.executive} />);

    expect(screen.getAllByLabelText("Suggested questions")[0].querySelectorAll("button")).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /Review Supplier Risk & Capacity Register.xlsx/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /carrier milestone/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Which supplier relationships should we consolidate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(requestBody.workflowKey).toBe("consolidate");
    expect(requestBody.demoPersona).toBe("executive");
    expect(requestBody.selectedSourceIds).toEqual(["sap", "contracts", "quality", "resilience", "policy", "word"]);
  });

  it("does not show the simulated process summary after prompting", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    expect(screen.queryByText("Analysis trace")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    expect(await screen.findAllByText(/PO 4500872319/i)).not.toHaveLength(0);
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
    expect(screen.getByRole("button", { name: /Copy answer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide reasoning" })).toBeInTheDocument();
    expect(screen.getByText("Checked role permissions, selected tools, retrieved grounded records, and prepared the response summary.")).toBeInTheDocument();
    expect(screen.queryByText("Traceability process")).not.toBeInTheDocument();
  });

  it("places copy and feedback actions below each generated answer", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
    const answer = await screen.findByRole("heading", { name: "Shipment options" });
    const copy = screen.getByRole("button", { name: "Copy answer" });

    expect(copy.closest(".answer-actions")).not.toBeNull();
    expect(answer.compareDocumentPosition(copy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Mark answer as helpful" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Mark answer as not helpful" })).toHaveLength(1);
  });

  it("copies the assistant answer and confirms a successful clipboard write", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
    await screen.findByRole("heading", { name: "Shipment options" });
    fireEvent.click(screen.getByRole("button", { name: "Copy answer" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText.mock.calls[0][0]).toContain("Shipment options");
    expect(await screen.findByRole("button", { name: "Answer copied" })).toBeInTheDocument();
  });

  it("does not confirm a rejected clipboard write", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Clipboard unavailable"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
    await screen.findByRole("heading", { name: "Shipment options" });
    fireEvent.click(screen.getByRole("button", { name: "Copy answer" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(screen.queryByRole("button", { name: "Answer copied" })).not.toBeInTheDocument();
  });

  it("collects optional feedback, confirms submission, and clears it with the conversation", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
    await screen.findByRole("heading", { name: "Shipment options" });
    const helpful = screen.getByRole("button", { name: "Mark answer as helpful" });
    fireEvent.click(helpful);

    expect(helpful).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByLabelText("Optional feedback"), {
      target: { value: "Clear and useful." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));

    expect(screen.queryByLabelText("Optional feedback")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Feedback received");
    expect(helpful).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Clear conversation" }));
    expect(screen.queryByText("Feedback received")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy answer" })).not.toBeInTheDocument();
  });

  it("opens feedback in a portal popover and closes it without moving message layout", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
    await screen.findByRole("heading", { name: "Shipment options" });
    const helpful = screen.getByRole("button", { name: "Mark answer as helpful" });
    fireEvent.click(helpful);

    const dialog = screen.getByRole("dialog", { name: "Answer feedback" });
    const field = screen.getByLabelText("Optional feedback");
    expect(dialog.closest(".message")).toBeNull();
    expect(dialog.parentElement).toHaveClass("app-shell");
    expect(field).toHaveFocus();
    expect(screen.getByRole("button", { name: "Close feedback" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close feedback" }));

    expect(screen.queryByRole("dialog", { name: "Answer feedback" })).not.toBeInTheDocument();
    expect(helpful).toHaveAttribute("aria-pressed", "false");
    expect(helpful).toHaveFocus();
  });

  it("dismisses an unsubmitted feedback popover with Escape or an outside pointer", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
    await screen.findByRole("heading", { name: "Shipment options" });
    const notHelpful = screen.getByRole("button", { name: "Mark answer as not helpful" });
    fireEvent.click(notHelpful);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Answer feedback" })).not.toBeInTheDocument();

    fireEvent.click(notHelpful);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog", { name: "Answer feedback" })).not.toBeInTheDocument();
    expect(notHelpful).toHaveAttribute("aria-pressed", "false");
  });

  it("restores submitted feedback when a reopened draft is dismissed", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
    await screen.findByRole("heading", { name: "Shipment options" });
    const helpful = screen.getByRole("button", { name: "Mark answer as helpful" });
    const notHelpful = screen.getByRole("button", { name: "Mark answer as not helpful" });
    fireEvent.click(helpful);
    fireEvent.change(screen.getByLabelText("Optional feedback"), {
      target: { value: "Keep this saved feedback." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));

    fireEvent.click(notHelpful);
    fireEvent.change(screen.getByLabelText("Optional feedback"), {
      target: { value: "Discard this edit." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Close feedback" }));

    expect(helpful).toHaveAttribute("aria-pressed", "true");
    expect(notHelpful).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("status")).toHaveTextContent("Feedback received");
    fireEvent.click(helpful);
    expect(screen.getByLabelText("Optional feedback")).toHaveValue("Keep this saved feedback.");
  });

  it("cancels unsubmitted feedback and leaves user messages without answer actions", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
    await screen.findByRole("heading", { name: "Shipment options" });
    const notHelpful = screen.getByRole("button", { name: "Mark answer as not helpful" });
    fireEvent.click(notHelpful);
    fireEvent.change(screen.getByLabelText("Optional feedback"), {
      target: { value: "Needs a clearer recommendation." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel feedback" }));

    expect(screen.queryByLabelText("Optional feedback")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Copy answer" })).toHaveLength(1);
    expect(notHelpful).toHaveAttribute("aria-pressed", "false");
  });

  it("retains an optional comment when changing or replacing a feedback rating", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
    await screen.findByRole("heading", { name: "Shipment options" });
    fireEvent.click(screen.getByRole("button", { name: "Mark answer as helpful" }));
    fireEvent.change(screen.getByLabelText("Optional feedback"), {
      target: { value: "Keep this context." },
    });
    const notHelpful = screen.getByRole("button", { name: "Mark answer as not helpful" });
    fireEvent.click(notHelpful);

    expect(notHelpful).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Optional feedback")).toHaveValue("Keep this context.");
    fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark answer as helpful" }));

    expect(screen.getByRole("button", { name: "Mark answer as helpful" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Optional feedback")).toHaveValue("Keep this context.");
  });

  it("removes submitted message feedback when the persona changes", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks/i }));
    await screen.findByRole("heading", { name: "Shipment options" });
    fireEvent.click(screen.getByRole("button", { name: "Mark answer as helpful" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));
    expect(screen.getByRole("status")).toHaveTextContent("Feedback received");

    fireEvent.change(screen.getByLabelText("Demo identity"), { target: { value: "procurement" } });

    expect(screen.queryByText("Feedback received")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy answer" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Chat messages")).not.toBeInTheDocument();
  });

  it("renders assistant markdown tables as table markup", async () => {
    mockChatStreamWithMarkdownTable();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    expect(await screen.findByRole("heading", { name: "Shipment options" })).toBeInTheDocument();
    expect(screen.getAllByRole("table").length).toBeGreaterThanOrEqual(1);
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
    expect(requestBody.selectedSourceIds).toEqual(["sap", "carriers", "warehouse", "outlook", "sharepoint", "word"]);
    expect(requestBody.selectedSourceIds).not.toContain("dhl");
    expect(requestBody.selectedSourceIds).not.toContain("fedex");
    expect(requestBody.selectedSourceIds).not.toContain("ups");
  });

  it("does not show deselected source evidence in the results panel", async () => {
    const fetchMock = mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Open chat settings/i }));
    fireEvent.click(screen.getByLabelText("Shipping providers"));

    expect(screen.getByText("5 / 6 data sources selected")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));

    const results = await screen.findByLabelText("Supply Chain Hub results");
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

    expect(requestBody.selectedSourceIds).not.toContain("carriers");
    expect(within(results).queryByText(/DHL Freight/i)).not.toBeInTheDocument();
    expect(within(results).queryByText(/00340434161094000012/i)).not.toBeInTheDocument();
    expect(within(results).queryByText(/PO 4500872319/i)).not.toBeInTheDocument();
    expect(within(results).queryByText(/FedEx Priority/i)).not.toBeInTheDocument();
  });

  it("only lets Lukas write Dana when Microsoft Outlook is selected and returns Dana's decision", async () => {
    const fetchMock = mockChatAndActionStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));
    await screen.findByRole("button", { name: /Write Dana Narid for review/i });

    fireEvent.click(screen.getByRole("button", { name: /Write Dana Narid for review/i }));

    await waitFor(() => expect(screen.getByText(/Approval request sent to Dana Narid/i)).toBeInTheDocument());
    const actionRequest = fetchMock.mock.calls.find((call) => String(call[0]).includes("/api/actions"));
    expect(JSON.parse(String(actionRequest?.[1]?.body))).toMatchObject({
      workflowKey: "risks",
      demoPersona: "logistics",
      selectedSourceIds: ["sap", "carriers", "warehouse", "outlook", "sharepoint", "word"],
      actionLabel: "Write Dana Narid for review",
    });
    expect(screen.getByText("Submitted requests")).toBeInTheDocument();
    const submittedApprovals = screen.getByLabelText("Human approval workflow");
    expect(
      within(submittedApprovals).getByText("Write Dana Narid for review"),
    ).toBeInTheDocument();
    expect(
      within(submittedApprovals).getByText("Pending review by Dana Narid"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approve Write Dana Narid for review/i })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), { target: { value: "procurement" } });

    expect(screen.getByText("Approval queue")).toBeInTheDocument();
    const incomingApprovals = screen.getByLabelText("Human approval workflow");
    expect(
      within(incomingApprovals).getByText("Review delivery risk summary"),
    ).toBeInTheDocument();
    expect(within(incomingApprovals).getByText("Review pending")).toBeInTheDocument();
    expect(screen.getByText("From Lukas Weber")).toBeInTheDocument();
    expect(screen.getByText(/DHL Freight shipment 00340434161094000012/i)).toBeInTheDocument();

    fireEvent.click(
      within(incomingApprovals).getByRole("button", {
        name: "Approve Review delivery risk summary",
      }),
    );

    expect(within(incomingApprovals).getByText("Approved")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), { target: { value: "logistics" } });

    expect(screen.getByText("Submitted requests")).toBeInTheDocument();
    expect(screen.getByText("Approved by Dana Narid")).toBeInTheDocument();
  });

  it("waits for action success before showing submitted approval state", async () => {
    const { resolveAction } = mockChatAndPendingActionStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));
    await screen.findByRole("button", { name: /Write Dana Narid for review/i });

    fireEvent.click(screen.getByRole("button", { name: /Write Dana Narid for review/i }));

    expect(await screen.findByText(/Running action workflow for Write Dana Narid for review/i)).toBeInTheDocument();
    expect(screen.queryByText("Submitted for review")).not.toBeInTheDocument();
    expect(screen.queryByText("Submitted requests")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Human approval workflow")).not.toBeInTheDocument();

    resolveAction(
      Response.json({
        actionLabel: "Write Dana Narid for review",
        recipientActionLabel: "Review delivery risk summary",
        reviewerPersona: "procurement",
        reviewerName: "Dana Narid",
        draft:
          "Write Dana Narid for review\n\nFrom Lukas Weber to Dana Narid.\n\nDHL Freight shipment 00340434161094000012 missed its Leipzig hub departure.",
        notice: "Approval request sent to Dana Narid.",
        orchestration: "agents-sdk",
        toolCalls: ["read_supply_chain_context", "prepare_action_workflow"],
      }),
    );

    expect(await screen.findByText("Submitted requests")).toBeInTheDocument();
    expect(screen.getByLabelText("Human approval workflow")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Running action workflow/i)).not.toBeInTheDocument());
  });

  it("creates self-assigned Microsoft Outlook tasks without using the approval workflow", async () => {
    mockChatAndActionStream({
      actionLabel: "Create Microsoft Outlook recovery task",
      reviewerPersona: null,
      reviewerName: null,
      draft: "Create Microsoft Outlook recovery task\n\nPrepared for Lukas Weber.",
      notice: "Task created for Lukas Weber. Track DHL confirmation, FedEx backup status and Oberkochen receiving cutoff before 12:00.",
      orchestration: "agents-sdk",
      toolCalls: ["read_supply_chain_context", "prepare_action_workflow"],
    });
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(screen.getByRole("button", { name: /Show me potential delivery risks for this week/i }));
    await screen.findByRole("button", { name: /Create Microsoft Outlook recovery task/i });

    fireEvent.click(screen.getByRole("button", { name: /Create Microsoft Outlook recovery task/i }));

    expect(await screen.findByText("My tasks")).toBeInTheDocument();
    expect(screen.getByText("Track DHL confirmation, FedEx backup status and Oberkochen receiving cutoff with Supply Chain Hub")).toBeInTheDocument();
    expect(screen.queryByText("Approval queue")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Mark Track DHL confirmation, FedEx backup status and Oberkochen receiving cutoff with Supply Chain Hub done/i }));

    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("assigns Dana's recovery check directly to Lukas", async () => {
    const fetchMock = mockChatAndActionStream({
      actionLabel: "Assign recovery check to logistics",
      assigneePersona: "logistics",
      assigneeName: "Lukas Weber",
      reviewerPersona: null,
      reviewerName: null,
      draft: "Assign recovery check to logistics\n\nFrom Dana Narid to Lukas Weber.",
      notice:
        "Task assigned to Lukas Weber. Create the carrier recovery task for the logistics planner to execute.",
      orchestration: "demo-fallback",
      toolCalls: [],
    });
    render(<SupplyChainApp currentUser={mockUsers.procurement} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Assign the carrier recovery check for the uncovered builds/i,
      }),
    );

    await screen.findByRole("button", {
      name: /Assign recovery check to logistics/i,
    });
    expect(
      screen.getByRole("button", { name: /Ask Lucia Lopez for exception review/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Write Dana Narid for review/i }),
    ).not.toBeInTheDocument();
    const chatRequest = fetchMock.mock.calls.find((call) =>
      String(call[0]).includes("/api/chat"),
    );
    expect(JSON.parse(String(chatRequest?.[1]?.body))).toMatchObject({
      workflowKey: "delay",
      demoPersona: "procurement",
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Assign recovery check to logistics/i }),
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some((call) => String(call[0]).includes("/api/actions")),
      ).toBe(true),
    );

    expect(
      await screen.findByText(/Task assigned to Lukas Weber/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Approval queue")).not.toBeInTheDocument();
    expect(screen.queryByText("Submitted requests")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Demo identity"), {
      target: { value: "logistics" },
    });

    const taskList = screen.getByLabelText("Personal task list");
    expect(within(taskList).getByText("Run recovery check")).toBeInTheDocument();
    expect(
      within(taskList).queryByText("Assign recovery check to logistics"),
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(taskList).getByRole("button", {
        name: "Mark Run recovery check done",
      }),
    );
    expect(within(taskList).getByText("Done")).toBeInTheDocument();
  });

  it("does not fabricate success for a rejected action", async () => {
    const fetchMock = mockChatAndRejectedActionStream();
    render(<SupplyChainApp currentUser={mockUsers.procurement} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Assign the carrier recovery check for the uncovered builds/i,
      }),
    );
    await screen.findByRole("button", {
      name: /Assign recovery check to logistics/i,
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Assign recovery check to logistics/i }),
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some((call) => String(call[0]).includes("/api/actions")),
      ).toBe(true),
    );

    expect(
      await screen.findByText("Action could not be completed. Please try again."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status").querySelector(".lucide-circle-x"),
    ).toBeInTheDocument();
    expect(screen.queryByText("My tasks")).not.toBeInTheDocument();
    expect(screen.queryByText("Approval queue")).not.toBeInTheDocument();
    expect(screen.queryByText("Submitted requests")).not.toBeInTheDocument();
  });

  it("removes an optimistic approval when a reviewer action is rejected", async () => {
    mockChatAndRejectedActionStream();
    render(<SupplyChainApp currentUser={mockUsers.logistics} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Show me potential delivery risks for this week/i,
      }),
    );
    await screen.findByRole("button", { name: /Write Dana Narid for review/i });
    fireEvent.click(
      screen.getByRole("button", { name: /Write Dana Narid for review/i }),
    );

    expect(
      await screen.findByText("Action could not be completed. Please try again."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Approval queue")).not.toBeInTheDocument();
    expect(screen.queryByText("Submitted requests")).not.toBeInTheDocument();
    expect(screen.queryByText("Pending review by Dana Narid")).not.toBeInTheDocument();
  });

  it("lets Lucia execute strategic actions without sending approval to Dana", async () => {
    mockChatAndActionStream({
      actionLabel: "Draft contract termination letter",
      reviewerPersona: null,
      reviewerName: null,
      draft: "Draft contract termination letter\n\nPrepared for Dr. Lucía López.",
      notice: "Draft prepared for Dr. Lucía López. Prepare a non-binding notice draft for Steripack Hohenlohe and PräziForm Aalen; no notice is sent.",
      orchestration: "agents-sdk",
      toolCalls: ["read_supply_chain_context", "prepare_action_workflow"],
    }, "matrix");
    render(<SupplyChainApp currentUser={mockUsers.executive} />);

    fireEvent.click(screen.getByRole("button", { name: /Show supplier consolidation options/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("table", { name: /supplier savings and strategic relationship matrix/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /Draft contract termination letter/i }));

    await waitFor(() => expect(screen.getByText(/Draft prepared for Dr. Lucía López/i)).toBeInTheDocument());
    expect(screen.queryByText("Approval queue")).not.toBeInTheDocument();
    expect(screen.queryByText(/Dana Narid/i)).not.toBeInTheDocument();
  });

  it("shows findings in the requested table without operational demo labels", async () => {
    mockChatStream();
    render(<SupplyChainApp currentUser={mockUsers.executive} />);

    fireEvent.click(screen.getByRole("button", { name: /Show supplier consolidation options/i }));

    await screen.findByRole("table", { name: "Supply Chain Hub findings" });
    const results = screen.getByLabelText("Supply Chain Hub results");

    expect(within(results).queryByText("Operational answer")).not.toBeInTheDocument();
    expect(within(results).queryByText("Grounded records")).not.toBeInTheDocument();
    expect(within(results).queryByText("Synthetic demo records")).not.toBeInTheDocument();
    expect(within(results).getByText("Affected material")).toBeInTheDocument();
    expect(within(results).getByText("Status")).toBeInTheDocument();
    expect(within(results).getByText("Expected arrival")).toBeInTheDocument();
    expect(within(results).getByText("Production buffer")).toBeInTheDocument();
    expect(within(results).getByText("Financial impact")).toBeInTheDocument();
  });
});
