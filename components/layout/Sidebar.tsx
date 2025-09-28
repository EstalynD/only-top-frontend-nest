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
  LogOut,
  User as UserIcon,
  ChevronDown,
  Shield,
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
  { 
    id: 'mi-perfil',
    href: '/profile', 
    label: 'Mi perfil',
    icon: <UserIcon size={18} />,
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

  // Dropdown: Sistema -> Gestionar roles
  const sistemaChildren = React.useMemo(() => ([
    {
      id: 'gestionar-roles',
      href: '/admin/rbac/roles',
      label: 'Gestionar roles',
      icon: <Shield size={16} />,
    },
    {
      id: 'gestionar-usuarios',
      href: '/admin/users',
      label: 'Usuarios',
      icon: <Users size={16} />,
    },
  ]), []);

  const grupoSistemaActivo = sistemaChildren.some((c) => isActive(c.href));
  const [sistemaOpen, setSistemaOpen] = React.useState<boolean>(false);
  React.useEffect(() => {
    if (grupoSistemaActivo) setSistemaOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
          background: variant === 'mobile' ? 'var(--background)' : 'var(--surface)',
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
              {/* Dropdown: Sistema */}
              <div className="space-y-1 mb-2">
                <button
                  onClick={() => setSistemaOpen((v) => !v)}
                  className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    grupoSistemaActivo ? 'shadow-sm' : 'ot-hover-surface hover:shadow-sm'
                  }`}
                  style={{
                    background: grupoSistemaActivo ? 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' : undefined,
                    color: grupoSistemaActivo ? '#ffffff' : 'var(--text-primary)',
                  }}
                  aria-expanded={sistemaOpen}
                  aria-controls="nav-sistema"
                >
                  <span className="flex items-center gap-3">
                    <Settings size={18} />
                    <span>Sistema</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${sistemaOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {sistemaOpen && (
                  <div id="nav-sistema" className="pl-3 space-y-1">
                    {sistemaChildren.map((child) => {
                      const active = isActive(child.href);
                      return (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={(e) => handleNavClick(child as any, e as any)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                            active ? 'shadow-sm' : 'ot-hover-surface hover:shadow-sm'
                          }`}
                          style={{
                            background: active ? 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' : undefined,
                            color: active ? '#ffffff' : 'var(--text-primary)'
                          }}
                        >
                          <span>{child.icon}</span>
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
