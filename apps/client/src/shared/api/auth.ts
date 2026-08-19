import type { ApiResponse, AuthUser } from "@inferno/shared";

export const getCurrentUser = async (
  signal?: AbortSignal,
): Promise<AuthUser | null> => {
  const response = await fetch("/auth/me", {
    credentials: "include",
    signal,
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load the current user");
  }

  const payload: unknown = await response.json();

  if (!isAuthResponse(payload)) {
    throw new Error("Invalid current-user response");
  }

  return payload.data;
};

export const logout = async (): Promise<void> => {
  const response = await fetch("/auth/logout", {
    credentials: "include",
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to log out");
  }
};

const isAuthResponse = (value: unknown): value is ApiResponse<AuthUser> => {
  if (!isRecord(value) || !isRecord(value.data)) {
    return false;
  }

  const user = value.data;

  return (
    typeof user.telegramId === "string" &&
    isOptionalString(user.telegramNumericId) &&
    isOptionalString(user.name) &&
    isOptionalString(user.username) &&
    isOptionalString(user.photoUrl)
  );
};

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === "string";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
