"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth } from '@/lib/auth';
import { meApi } from '@/lib/http';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, ready } = useRequireAuth();
  const { token, setToken } = useAuth();

  React.useEffect(() => {
    if (!ready) return;
    (async () => {
      if (!isAuthenticated || !token) {
        router.replace('/login');
        return;
      }
      try {
        await meApi(token);
      } catch {
        setToken(null);
        router.replace('/login');
      }
    })();
  }, [ready, isAuthenticated, token, router, setToken]);

  if (!ready) return null; // Evitar parpadeo inicial
  if (!isAuthenticated) return null; // Mientras redirige

  return <>{children}</>;
}
