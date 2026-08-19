import type { AuthUser } from "@inferno/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentUser, logout as requestLogout } from "@/shared/api";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue, AuthStatus } from "./AuthContext";

const SESSION_VERIFICATION_ERROR =
  "Unable to verify your session. Please try again.";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
  });
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );

  const verifySession = useCallback(async (signal?: AbortSignal) => {
    setState({ status: "loading", user: null });
    setVerificationError(null);

    try {
      const user = await getCurrentUser(signal);

      if (signal?.aborted) {
        return;
      }

      setState(
        user
          ? { status: "authenticated", user }
          : { status: "unauthenticated", user: null },
      );
    } catch (error: unknown) {
      if (signal?.aborted || isAbortError(error)) {
        return;
      }

      setState({ status: "loading", user: null });
      setVerificationError(SESSION_VERIFICATION_ERROR);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void verifySession(controller.signal);

    return () => controller.abort();
  }, [verifySession]);

  const retry = useCallback(async () => {
    await verifySession();
  }, [verifySession]);

  const logout = useCallback(async () => {
    await requestLogout();
    setVerificationError(null);
    setState({ status: "unauthenticated", user: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      verificationError,
      retry,
      logout,
    }),
    [logout, retry, state, verificationError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";
