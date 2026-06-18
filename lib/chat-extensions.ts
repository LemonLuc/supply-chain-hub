import type { AppContext } from "./context";

export async function loadExternalContext(_query: string, _context: AppContext): Promise<string[]> {
  // MCP and RAG providers can add grounded passages here without changing the route contract.
  return [];
}

export function getChatTools() {
  // MCP-backed tools can be registered here as the application grows.
  return {};
}
