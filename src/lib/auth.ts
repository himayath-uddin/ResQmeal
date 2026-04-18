export const AUTH_ROLES = ["donor", "ngo", "volunteer"] as const;
export type UserRole = (typeof AUTH_ROLES)[number];

export type AuthSession = {
  user_id: string;
  email: string;
  role: UserRole;
};

export function isValidRole(role: unknown): role is UserRole {
  return typeof role === "string" && AUTH_ROLES.includes(role as UserRole);
}

export function getDashboardRoute(role: UserRole) {
  if (role === "donor") {
    return "/donor-dashboard";
  }

  if (role === "ngo") {
    return "/ngo-dashboard";
  }

  return "/volunteer-dashboard";
}

export function getUserLabel(email: string) {
  const localPart = email.split("@")[0] || "user";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
