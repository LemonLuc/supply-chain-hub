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
    role: "Procurement Team Lead",
    businessUnit: "Semiconductor Manufacturing Technology",
    persona: "procurement",
  },
  executive: {
    name: "Dr. Elena Fischer",
    initials: "EF",
    role: "Chief Logistics Officer",
    businessUnit: "Corporate Supply Chain",
    persona: "executive",
  },
};

export function getCurrentUser(
  env: Record<string, string | undefined> = process.env,
): CurrentUser {
  if (env.DEMO_USER_ROLE === "executive") return mockUsers.executive;
  return env.DEMO_USER_ROLE === "procurement" ? mockUsers.procurement : mockUsers.logistics;
}
