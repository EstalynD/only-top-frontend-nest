"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Settings, 
  FileText,
  X,
  LogOut
} from 'lucide-react';

type SidebarProps = {
  variant?: 'desktop' | 'mobile';
  open?: boolean;
  onClose?: () => void;
};

type NavItem = { 
  id: string;
  href: string; 
  label: string; 
  icon: React.ReactNode;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { 
    id: 'dashboard',
    href: '/dashboard', 
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />
  },
  { 
    id: 'reportes',
    href: '/reportes', 
    label: 'Reportes',
    icon: <BarChart3 size={18} />,
    disabled: true
  },
  { 
    id: 'usuarios',
    href: '/usuarios', 
    label: 'Usuarios',
    icon: <Users size={18} />,
    disabled: true
  },
  { 
    id: 'documentos',
    href: '/documentos', 
    label: 'Documentos',
    icon: <FileText size={18} />,
    disabled: true
  },
  { 
    id: 'configuracion',
    href: '/configuracion', 
    label: 'Configuración',
    icon: <Settings size={18} />,
    disabled: true
  },
];

export function Sidebar({ variant = 'desktop', open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { setToken } = useAuth();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '#' || !href) return false;
    try { 
      return pathname === href || (href !== '/' && pathname?.startsWith(href));
    } catch { 
      return false; 
    }
  };

  const Container: React.ElementType = variant === 'mobile' ? 'div' : 'aside';
  const mobileStyles: React.CSSProperties | undefined = variant === 'mobile'
    ? {
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        width: '18rem',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 50,
        boxShadow: open ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
      }
    : undefined;

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    if (variant === 'mobile') {
      onClose?.();
    }
  };

  const logout = React.useCallback(() => {
    setToken(null);
    router.replace('/login');
  }, [router, setToken]);

  return (
    <>
      {/* Mobile backdrop */}
      {variant === 'mobile' && open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <Container
        className={`h-full w-72 flex flex-col ${
          variant === 'desktop' ? 'border-r shadow-sm' : 'shadow-2xl'
        }`}
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          ...(mobileStyles ?? {}),
        }}
        aria-label="Sidebar navigation"
      >
        {/* Header - only for mobile */}
        {variant === 'mobile' && (
          <div className="h-16 flex items-center justify-between px-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
              >
                <span className="text-white font-bold text-sm">OT</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  OnlyTop
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Panel de control
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar menú"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg ot-hover-surface transition-colors"
              style={{ border: '1px solid var(--border)' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="mb-4">
            <h3 
              className="px-3 text-xs font-medium uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Navegación
            </h3>
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isItemActive = isActive(item.href);
                
                const commonProps = {
                  onClick: (e: React.MouseEvent) => handleNavClick(item, e),
                  className: `
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isItemActive 
                      ? 'shadow-sm' 
                      : item.disabled 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'ot-hover-surface hover:shadow-sm'
                    }
                  `,
                  style: {
                    background: isItemActive 
                      ? 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))'
                      : undefined,
                    color: isItemActive 
                      ? '#ffffff' 
                      : item.disabled 
                        ? 'var(--text-muted)'
                        : 'var(--text-primary)',
                  },
                  title: item.disabled ? 'Próximamente disponible' : undefined,
                };
                
                if (item.disabled) {
                  return (
                    <div {...commonProps} key={item.id}>
                      <span key="icon" className={`transition-transform duration-200 ${isItemActive ? '' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      <span key="label" className="truncate">
                        {item.label}
                      </span>
                      {item.disabled && (
                        <span key="badge" className="ml-auto text-xs px-2 py-1 rounded-full" style={{ 
                          background: 'var(--surface-muted)', 
                          color: 'var(--text-muted)' 
                        }}>
                          Próximamente
                        </span>
                      )}
                    </div>
                  );
                }
                
                return (
                  <Link
                    {...commonProps}
                    href={item.href}
                    key={item.id}
                  >
                    <span key="icon" className={`transition-transform duration-200 ${isItemActive ? '' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span key="label" className="truncate">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg ot-hover-surface transition-colors text-sm"
            style={{ color: '#ef4444' }}
            title="Cerrar sesión"
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
          <div className="text-center mt-3">
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              © 2025 OnlyTop
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Versión 1.0.0
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
