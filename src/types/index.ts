export const ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER", "EMPLOYEE"] as const;
export type Role = (typeof ROLES)[number];

export const GAME_TYPES = ["MEMORY", "QUIZ", "REACTION"] as const;
export type GameType = (typeof GAME_TYPES)[number];

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const PLANS = ["FREE", "PRO", "ENTERPRISE"] as const;
export type Plan = (typeof PLANS)[number];

export const CHALLENGE_TYPES = ["PHOTO", "VIDEO", "TEXT", "ACTIVITY"] as const;
export type ChallengeType = (typeof CHALLENGE_TYPES)[number];

export const ROOM_TYPES = ["COMPANY", "TEAM", "DM"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const NOTIFICATION_TYPES = [
  "ACHIEVEMENT",
  "CHALLENGE",
  "MESSAGE",
  "GAME_INVITE",
  "SYSTEM",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export function isAdminRole(role?: Role | null) {
  return role === "SUPER_ADMIN" || role === "COMPANY_ADMIN" || role === "HR_MANAGER";
}
