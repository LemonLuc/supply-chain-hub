import { render, screen } from "@testing-library/react";
import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";

import { buildAppContext } from "@/lib/context";
import { workflows } from "@/lib/demo-data";
import { createDemoSlideVisual, resolveOperationalChart } from "@/lib/chat-visuals";
import { resolveSupplierPortfolioVisualization } from "@/lib/supplier-portfolio";

import { ChatMessageVisual, getMessageVisual } from "./chat-message-visual";

function assistantMessage(parts: Array<Record<string, unknown>>): UIMessage {
  return { id: "assistant-1", role: "assistant", parts } as unknown as UIMessage;
}

describe("ChatMessageVisual", () => {
  it("renders a completed trusted supplier visualization", () => {
    const output = resolveSupplierPortfolioVisualization(
      workflows.consolidate.heatMap ?? [],
      "matrix",
      "Decision bands support a compact comparison.",
    );
    const visual = getMessageVisual(assistantMessage([{
      type: "tool-renderSupplierPortfolio",
      state: "output-available",
      toolCallId: "portfolio-1",
      output,
    }]));

    render(<ChatMessageVisual visual={visual} />);

    expect(screen.getByRole("table", { name: /supplier savings and strategic relationship matrix/i })).toBeInTheDocument();
  });

  it("renders a completed operational bar chart with direct values", () => {
    const output = resolveOperationalChart(
      buildAppContext("delay", "procurement", ["sap", "quality", "excel", "capacity"]),
    );
    const visual = getMessageVisual(assistantMessage([{
      type: "tool-renderOperationalChart",
      state: "output-available",
      toolCallId: "chart-1",
      output,
    }]));

    render(<ChatMessageVisual visual={visual} />);

    expect(screen.getByRole("img", { name: "Approved alternate coverage" })).toBeInTheDocument();
    expect(screen.getByText("Affected builds")).toBeInTheDocument();
    expect(screen.getByText("14 builds")).toBeInTheDocument();
    expect(screen.getByText("8 builds")).toBeInTheDocument();
    expect(screen.getByText("6 builds")).toBeInTheDocument();
  });

  it("renders completed live image output with alt text and download", () => {
    const result = Buffer.from("a sufficiently long fake webp image payload", "utf8").toString("base64");
    const visual = getMessageVisual(assistantMessage([{
      type: "tool-generateSlideVisual",
      state: "output-available",
      toolCallId: "image-1",
      output: { result },
    }]));

    render(<ChatMessageVisual visual={visual} />);

    const image = screen.getByRole("img", { name: "Generated supply-chain slide visual" });
    expect(image).toHaveAttribute("src", `data:image/webp;base64,${result}`);
    expect(screen.getByRole("link", { name: "Download image" })).toHaveAttribute(
      "download",
      "supply-chain-slide-visual.webp",
    );
    expect(screen.queryByText("Demo preview")).not.toBeInTheDocument();
  });

  it("labels a deterministic SVG as a demo preview", () => {
    const output = createDemoSlideVisual(buildAppContext("risks", "logistics", []));
    const visual = getMessageVisual(assistantMessage([{
      type: "tool-generateSlideVisual",
      state: "output-available",
      toolCallId: "image-1",
      output,
    }]));

    render(<ChatMessageVisual visual={visual} />);

    expect(screen.getByText("Demo preview")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: output.alt })).toHaveAttribute(
      "src",
      expect.stringMatching(/^data:image\/svg\+xml;base64,/),
    );
  });

  it("ignores incomplete and malformed visual output", () => {
    expect(getMessageVisual(assistantMessage([{
      type: "tool-renderOperationalChart",
      state: "input-streaming",
      toolCallId: "chart-1",
    }]))).toBeUndefined();
    expect(getMessageVisual(assistantMessage([{
      type: "tool-generateSlideVisual",
      state: "output-available",
      toolCallId: "image-1",
      output: { result: "not base64!" },
    }]))).toBeUndefined();
  });

  it("shows a compact retryable status for a visual tool error", () => {
    const visual = getMessageVisual(assistantMessage([{
      type: "tool-generateSlideVisual",
      state: "output-error",
      toolCallId: "image-1",
      errorText: "Image generation unavailable",
    }]));

    render(<ChatMessageVisual visual={visual} />);

    expect(screen.getByRole("status")).toHaveTextContent("Visual unavailable. Try asking again.");
  });
});
