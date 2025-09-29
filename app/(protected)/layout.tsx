"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth } from '@/lib/auth';
import { me } from '@/lib/service-auth/api';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, ready } = useRequireAuth();
  const { token, setToken } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!ready) return;
    (async () => {
      if (!isAuthenticated || !token) {
        router.replace('/login');
        return;
      }
      try {
  await me(token);
      } catch {
        setToken(null);
        router.replace('/login');
      }
    })();
  }, [ready, isAuthenticated, token, router, setToken]);

  if (!ready) return null; // Evitar parpadeo inicial
  if (!isAuthenticated) return null; // Mientras redirige

  return (
    <ToastProvider>
      <div className="min-h-dvh flex flex-col" style={{ background: 'var(--color-background)', color: 'var(--color-foreground)' }}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1">
          {/* Grid desktop: 18rem sidebar + contenido */}
          <div className="hidden md:grid md:grid-cols-[18rem_1fr] md:gap-0">
            <Sidebar variant="desktop" />
            <main className="p-4">{children}</main>
          </div>

          {/* Stack móvil */}
          <div className="md:hidden relative">
            {/* Sidebar móvil con overlay */}
            {sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 md:hidden"
                  style={{ background: 'rgba(0,0,0,0.35)' }}
                  onClick={() => setSidebarOpen(false)}
                />
                <Sidebar
                  variant="mobile"
                  open={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                />
              </>
            )}

            {/* Contenido */}
            <main className="p-4">{children}</main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
