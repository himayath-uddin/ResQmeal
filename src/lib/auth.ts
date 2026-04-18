export const AUTH_STORAGE_KEY = "resqmeal_session";

export type AuthSession = {
  user_id: string;
  email: string;
  role: "donor" | "ngo";
};

export function getUserLabel(email: string) {
  const localPart = email.split("@")[0] || "user";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      typeof parsed.user_id !== "string" ||
      typeof parsed.email !== "string" ||
      (parsed.role !== "donor" && parsed.role !== "ngo")
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsed as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
}
