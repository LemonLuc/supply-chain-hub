import type { PersonaId } from "./permissions";

export type CurrentUser = {
  name: string;
  initials: string;
  role: string;
  businessUnit: string;
  persona: PersonaId;
};

export const mockUsers: Record<PersonaId, CurrentUser> = {
  logistics: {
    name: "Lukas Weber",
    initials: "LW",
    role: "Logistics Planner",
    businessUnit: "Industrial Quality & Research",
    persona: "logistics",
  },
  procurement: {
    name: "Anna Keller",
    initials: "AK",
    role: "Procurement Lead",
    businessUnit: "Semiconductor Manufacturing Technology",
    persona: "procurement",
  },
};

export function getCurrentUser(
  env: Record<string, string | undefined> = process.env,
): CurrentUser {
  return env.DEMO_USER_ROLE === "procurement" ? mockUsers.procurement : mockUsers.logistics;
}
