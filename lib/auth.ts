import type { PersonaId } from "./permissions";

export type CurrentUser = {
  name: string;
  avatarSrc: string;
  role: string;
  businessUnit: string;
  persona: PersonaId;
};

export const mockUsers: Record<PersonaId, CurrentUser> = {
  logistics: {
    name: "Lukas Weber",
    avatarSrc: "/avatars/lukas-weber.png",
    role: "Logistics Planner",
    businessUnit: "Industrial Quality & Research",
    persona: "logistics",
  },
  procurement: {
    name: "Dana Narid",
    avatarSrc: "/avatars/dana-narid.png",
    role: "Procurement Team Lead",
    businessUnit: "Semiconductor Manufacturing Technology",
    persona: "procurement",
  },
  executive: {
    name: "Dr. Lucía López",
    avatarSrc: "/avatars/lucia-lopez.png",
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
