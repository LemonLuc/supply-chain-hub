import { jsonSchema, tool, type ToolSet } from "ai";

import type { AppContext } from "./context";
import { resolveOperationalChart } from "./chat-visuals";
import {
  resolveSupplierPortfolioVisualization,
  type SupplierPortfolioView,
} from "./supplier-portfolio";

export async function loadExternalContext(_query: string, _context: AppContext): Promise<string[]> {
  // MCP and RAG providers can add grounded passages here without changing the route contract.
  return [];
}

type SupplierPortfolioToolInput = {
  preferredView: SupplierPortfolioView;
  reason: string;
};

type OperationalChartToolInput = {
  visualId: string;
  reason: string;
};

export function getChatTools(
  context: AppContext,
  options: { allowOperationalChart?: boolean; allowSupplierPortfolio?: boolean } = {},
): ToolSet {
  const suppliers = context.decisionSupport?.heatMap;
  const operationalChart = options.allowOperationalChart
    ? resolveOperationalChart(context)
    : undefined;

  const tools: ToolSet = {};

  if (options.allowSupplierPortfolio && suppliers?.length) {
    tools.renderSupplierPortfolio = tool({
      description:
        "Select the most decision-useful presentation for the authorized supplier portfolio. The server supplies all trusted supplier records.",
      strict: true,
      inputSchema: jsonSchema<SupplierPortfolioToolInput>({
        type: "object",
        additionalProperties: false,
        properties: {
          preferredView: {
            type: "string",
            enum: ["matrix", "bubble"],
            description:
              "Use matrix for a compact decision heat map. Use bubble when annual consolidation savings, strategic relationship score, and annual supplier cost materially improve the answer.",
          },
          reason: {
            type: "string",
            minLength: 1,
            maxLength: 180,
            description: "A concise explanation of why this view best supports the decision.",
          },
        },
        required: ["preferredView", "reason"],
      }),
      execute: async ({ preferredView, reason }) =>
        resolveSupplierPortfolioVisualization(suppliers, preferredView, reason),
    });
  }

  if (operationalChart) {
    tools.renderOperationalChart = tool({
      description:
        "Render the available authorized operational comparison. The server supplies every label and numeric value; never provide chart data in the tool input.",
      strict: true,
      inputSchema: jsonSchema<OperationalChartToolInput>({
        type: "object",
        additionalProperties: false,
        properties: {
          visualId: {
            type: "string",
            enum: [operationalChart.id],
            description: `The only chart available for this context: ${operationalChart.id}.`,
          },
          reason: {
            type: "string",
            minLength: 1,
            maxLength: 180,
            description: "A concise explanation of why the trusted comparison supports the answer.",
          },
        },
        required: ["visualId", "reason"],
      }),
      execute: async ({ visualId }) => {
        if (visualId !== operationalChart.id) throw new Error("Unknown authorized chart.");
        return operationalChart;
      },
    });
  }

  return tools;
}
