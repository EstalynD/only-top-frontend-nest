"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, ready } = useRequireAuth();

  React.useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [ready, isAuthenticated, router]);

  if (!ready) return null; // Evitar parpadeo inicial
  if (!isAuthenticated) return null; // Mientras redirige

  return <>{children}</>;
}
