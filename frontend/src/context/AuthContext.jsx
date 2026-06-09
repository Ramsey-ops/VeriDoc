import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("veridoc_token"));
  const payload = token ? parseJwt(token) : null;

  const value = useMemo(
    () => ({
      token,
      userRole: payload?.role ?? null,
      username: payload?.sub ?? null,
      signIn(nextToken) {
        localStorage.setItem("veridoc_token", nextToken);
        setToken(nextToken);
      },
      signOut() {
        localStorage.removeItem("veridoc_token");
        setToken(null);
      },
    }),
    [payload?.role, payload?.sub, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
