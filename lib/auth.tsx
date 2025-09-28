"use client";
import React from 'react';

type AuthContextType = {
  token: string | null;
  setToken: (t: string | null, remember?: boolean) => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem('ot_token');
      if (t) setTokenState(t);
    } catch {}
  }, []);

  const setToken = React.useCallback((t: string | null, remember = true) => {
    setTokenState(t);
    try {
      if (t && remember) localStorage.setItem('ot_token', t);
      else localStorage.removeItem('ot_token');
    } catch {}
  }, []);

  const value = React.useMemo(() => ({ token, setToken }), [token, setToken]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireAuth() {
  const { token } = useAuth();
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    // Marcamos ready después de primer render para evitar parpadeos
    setReady(true);
  }, []);
  return { isAuthenticated: !!token, ready };
}
