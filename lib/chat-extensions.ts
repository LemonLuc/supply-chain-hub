import { jsonSchema, tool } from "ai";

import type { AppContext } from "./context";
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

export function getChatTools(context: AppContext) {
  const suppliers = context.decisionSupport?.heatMap;
  if (!suppliers?.length) return {};

  return {
    renderSupplierPortfolio: tool({
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
              "Use matrix for categorical comparison. Use bubble only when numeric cost and resilience measures materially improve the answer.",
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
    }),
  };
}
