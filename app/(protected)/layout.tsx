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
      <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 min-h-0">
          <Sidebar variant="desktop" />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 min-h-0 relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
              <Sidebar
                variant="mobile"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </>
          )}

          {/* Mobile Content */}
          <main className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
