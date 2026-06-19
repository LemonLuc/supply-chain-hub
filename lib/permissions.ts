import type { WorkflowKey } from "./demo-data";

export const personas = [
  { id: "logistics", label: "Logistics planner" },
  { id: "procurement", label: "Procurement lead" },
] as const;

export type PersonaId = (typeof personas)[number]["id"];

const personaPolicies: Record<
  PersonaId,
  { canViewFinancials: boolean; allowedWorkflows: WorkflowKey[] }
> = {
  logistics: {
    canViewFinancials: false,
    allowedWorkflows: ["risks"],
  },
  procurement: {
    canViewFinancials: true,
    allowedWorkflows: ["risks", "delay", "consolidate"],
  },
};

export function normalizePersona(value: unknown): PersonaId {
  return value === "procurement" ? "procurement" : "logistics";
}

export function getPersonaPolicy(value: unknown) {
  return personaPolicies[normalizePersona(value)];
}

export function canAccessWorkflow(persona: unknown, workflowKey: WorkflowKey): boolean {
  return getPersonaPolicy(persona).allowedWorkflows.includes(workflowKey);
}
