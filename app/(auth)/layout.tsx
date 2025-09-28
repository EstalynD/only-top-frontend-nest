"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { meApi } from '@/lib/http';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { token, ready, setToken } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!ready) return;
    (async () => {
      if (!token) return;
      try {
        await meApi(token);
        router.replace('/dashboard');
      } catch {
        setToken(null);
      }
    })();
  }, [ready, token, router, setToken]);

  if (!ready) return null;
  if (token) return null; // Evita ver login si ya hay sesión

  return <>{children}</>;
}
