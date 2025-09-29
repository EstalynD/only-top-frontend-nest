"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/lib/service-user/api';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Settings, 
  FileText,
  X,
  LogOut,
  User as UserIcon,
  ChevronRight,
  Shield,
  Mail,
  DollarSign,
  Clock,
  HelpCircle,
  ExternalLink,
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
  badge?: string;
  badgeColor?: string;
};

type NavGroup = {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: NavItem[];
  requiresPermission?: string;
};

const MAIN_NAV_ITEMS: NavItem[] = [
  { 
    id: 'dashboard',
    href: '/dashboard', 
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    badge: 'Nuevo',
    badgeColor: '#10b981'
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
];

const SYSTEM_GROUP: NavGroup = {
  id: 'sistema',
  label: 'Sistema',
  icon: <Shield size={18} />,
  requiresPermission: 'system.admin',
  children: [
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
  ]
};

const CONFIG_GROUP: NavGroup = {
  id: 'configuracion',
  label: 'Configuración',
  icon: <Settings size={18} />,
  children: [
    {
      id: 'config-general',
      href: '/configuracion',
      label: 'General',
      icon: <Settings size={16} />,
    },
    {
      id: 'config-email',
      href: '/configuracion/email',
      label: 'Email',
      icon: <Mail size={16} />,
    },
    {
      id: 'config-finanzas',
      href: '/configuracion/finanzas',
      label: 'Finanzas',
      icon: <DollarSign size={16} />,
    },
    {
      id: 'config-asistencia',
      href: '/configuracion/asistencia',
      label: 'Asistencia',
      icon: <Clock size={16} />,
    },
  ]
};

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { 
    id: 'mi-perfil',
    href: '/profile', 
    label: 'Mi perfil',
    icon: <UserIcon size={18} />,
  },
  { 
    id: 'ayuda',
    href: '/ayuda', 
    label: 'Ayuda',
    icon: <HelpCircle size={18} />,
    disabled: true
  },
];

function NavGroupComponent({ 
  group, 
  isOpen, 
  onToggle, 
  onItemClick,
  hasAnyChildActive 
}: { 
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: (item: NavItem, e: React.MouseEvent) => void;
  hasAnyChildActive: boolean;
}) {
  const pathname = usePathname();
  
  const isItemActive = (href: string) => {
    if (href === '#' || !href) return false;
    try { 
      // For exact matches
      if (pathname === href) return true;
      
      // For configuration general, only match exact path
      if (href === '/configuracion') {
        return pathname === '/configuracion';
      }
      
      // For other paths, check if starts with (but not for root)
      return href !== '/' && pathname?.startsWith(href);
    } catch { 
      return false; 
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className="group/btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        style={{
          background: hasAnyChildActive ? 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))' : 'transparent',
          color: hasAnyChildActive ? '#ffffff' : 'var(--text-primary)',
        }}
        onMouseEnter={(e) => {
          if (!hasAnyChildActive) {
            e.currentTarget.style.background = 'var(--surface)';
          }
        }}
        onMouseLeave={(e) => {
          if (!hasAnyChildActive) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
        aria-expanded={isOpen}
        aria-controls={`nav-${group.id}`}
      >
        <span className="flex items-center gap-3">
          <span 
            className="transition-all duration-300"
            style={{
              transform: hasAnyChildActive ? 'rotate(0deg) scale(1)' : 'rotate(0deg) scale(1)',
              animation: hasAnyChildActive && group.id === 'configuracion' ? 'spin 2s linear infinite' : 
                        hasAnyChildActive && group.id === 'sistema' ? 'shield-pulse 2s ease-in-out infinite' : 'none',
            }}
          >
            {group.icon}
          </span>
          <span>{group.label}</span>
        </span>
        <ChevronRight
          size={16}
          className="transition-transform duration-300 ease-out"
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            color: hasAnyChildActive ? 'var(--ot-blue-600)' : 'var(--text-muted)',
          }}
        />
      </button>
      
      <div
        id={`nav-${group.id}`}
        className="transition-all duration-300 ease-out overflow-hidden"
        style={{
          maxHeight: isOpen ? `${group.children.length * 44}px` : '0',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="pl-6 pt-1 space-y-0.5">
          {group.children.map((child) => {
            const active = isItemActive(child.href);
            return (
              <Link
                key={child.id}
                href={child.href}
                onClick={(e) => onItemClick(child, e)}
                className="group/item relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: active ? 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))' : 'transparent',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--surface)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {/* Animated left border */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r transition-all duration-300"
                  style={{
                    width: active ? '3px' : '0px',
                    height: active ? '20px' : '0px',
                    background: 'linear-gradient(to bottom, var(--ot-blue-500), var(--ot-blue-600))',
                  }}
                />
                
                <span 
                  className="transition-all duration-300"
                  style={{
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                    color: active ? '#ffffff' : 'inherit',
                  }}
                >
                  {child.icon}
                </span>
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NavItemComponent({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: NavItem;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  const commonProps = {
    onClick,
    onMouseEnter: () => !item.disabled && setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    className: `
      group/navitem relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
      ${item.disabled ? 'cursor-not-allowed opacity-50' : ''}
    `,
    style: {
      background: isActive 
        ? 'linear-gradient(90deg, var(--ot-blue-500), var(--ot-blue-700))' 
        : isHovered && !item.disabled 
          ? 'var(--surface)' 
          : 'transparent',
      color: isActive 
        ? '#ffffff' 
        : item.disabled 
          ? 'var(--text-muted)'
          : isHovered 
            ? 'var(--text-primary)'
            : 'var(--text-secondary)',
      fontWeight: isActive ? 600 : 400,
    },
    title: item.disabled ? 'Próximamente disponible' : undefined,
  };
  
  const content = (
    <>
      {/* Animated left border */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r transition-all duration-300"
        style={{
          width: isActive ? '3px' : '0px',
          height: isActive ? '24px' : '0px',
          background: 'linear-gradient(to bottom, var(--ot-blue-500), var(--ot-blue-600))',
        }}
      />
      
      <span 
        className="transition-all duration-300"
        style={{
          transform: isActive ? 'scale(1.1)' : isHovered && !item.disabled ? 'scale(1.05)' : 'scale(1)',
          color: isActive ? '#ffffff' : 'inherit',
          animation: isActive && (item.id === 'config-general' || item.label === 'General') ? 'spin 2s linear infinite' : 'none',
        }}
      >
        {item.icon}
      </span>
      <span className="truncate flex-1">{item.label}</span>
      
      {item.badge && !item.disabled && (
        <span 
          className="text-xs px-2 py-0.5 rounded-full font-medium transition-transform duration-200"
          style={{ 
            background: item.badgeColor || 'var(--ot-blue-500)',
            color: '#ffffff',
            fontSize: '0.625rem',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {item.badge}
        </span>
      )}
      {item.disabled && (
        <span 
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ 
            background: 'var(--surface-muted)', 
            color: 'var(--text-muted)',
            fontSize: '0.625rem'
          }}
        >
          Próximamente
        </span>
      )}
    </>
  );
  
  if (item.disabled) {
    return <div {...commonProps}>{content}</div>;
  }
  
  return (
    <Link {...commonProps} href={item.href}>
      {content}
    </Link>
  );
}

export function Sidebar({ variant = 'desktop', open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { setToken, token, ready } = useAuth();
  const router = useRouter();
  const [hasSystemAdmin, setHasSystemAdmin] = React.useState(false);
  const [systemOpen, setSystemOpen] = React.useState(false);
  const [configOpen, setConfigOpen] = React.useState(false);

  const isActive = React.useCallback((href: string) => {
    if (href === '#' || !href) return false;
    try {
      if (pathname === href) return true;
      if (href === '/configuracion') {
        return pathname === '/configuracion';
      }
      return href !== '/' && pathname?.startsWith(href);
    } catch {
      return false;
    }
  }, [pathname]);

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
        boxShadow: open ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none',
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

  // Cargar permisos del usuario
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!ready || !token) {
        setHasSystemAdmin(false);
        return;
      }
      try {
        const me = await getProfile(token);
        const perms = me.user?.permissions ?? [];
        if (!cancelled) setHasSystemAdmin(perms.includes('system.admin'));
      } catch {
        if (!cancelled) setHasSystemAdmin(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [token, ready]);

  // Auto-expand groups based on active route
  React.useEffect(() => {
    if (hasSystemAdmin) {
      const systemActive = SYSTEM_GROUP.children.some((c) => isActive(c.href));
      if (systemActive) setSystemOpen(true);
    }
    
    const configActive = CONFIG_GROUP.children.some((c) => isActive(c.href));
    if (configActive) setConfigOpen(true);
  }, [pathname, hasSystemAdmin, isActive]);

  const systemGroupHasActive = hasSystemAdmin && SYSTEM_GROUP.children.some((c) => isActive(c.href));
  const configGroupHasActive = CONFIG_GROUP.children.some((c) => isActive(c.href));

  return (
    <>
      {/* Mobile backdrop */}
      {variant === 'mobile' && open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <Container
        className={`w-72 flex flex-col ${
          variant === 'desktop' 
            ? 'border-r sticky top-16 h-[calc(100dvh-4rem)]'
            : ''
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
          <div 
            className="h-16 flex items-center justify-between px-6 border-b" 
            style={{ 
              borderColor: 'var(--border)',
              background: 'var(--surface)'
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105"
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
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200"
              style={{ 
                border: '1px solid var(--border)',
                background: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Main Navigation */}
          <div>
            <div className="flex items-center gap-2 px-3 mb-3">
              <h3 
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Principal
              </h3>
            </div>
            <div className="space-y-1">
              {MAIN_NAV_ITEMS.map((item) => (
                <NavItemComponent
                  key={item.id}
                  item={item}
                  isActive={isActive(item.href)}
                  onClick={(e) => handleNavClick(item, e)}
                />
              ))}
            </div>
          </div>

          {/* System Group */}
          {hasSystemAdmin && (
            <div>
              <div className="flex items-center gap-2 px-3 mb-3">
                <h3 
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Administración
                </h3>
              </div>
              <NavGroupComponent
                group={SYSTEM_GROUP}
                isOpen={systemOpen}
                onToggle={() => setSystemOpen(v => !v)}
                onItemClick={handleNavClick}
                hasAnyChildActive={systemGroupHasActive}
              />
            </div>
          )}

          {/* Configuration Group */}
          <div>
            <div className="flex items-center gap-2 px-3 mb-3">
              <h3 
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Ajustes
              </h3>
            </div>
            <NavGroupComponent
              group={CONFIG_GROUP}
              isOpen={configOpen}
              onToggle={() => setConfigOpen(v => !v)}
              onItemClick={handleNavClick}
              hasAnyChildActive={configGroupHasActive}
            />
          </div>

          {/* Bottom Navigation */}
          <div>
            <div className="flex items-center gap-2 px-3 mb-3">
              <h3 
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Personal
              </h3>
            </div>
            <div className="space-y-1">
              {BOTTOM_NAV_ITEMS.map((item) => (
                <NavItemComponent
                  key={item.id}
                  item={item}
                  isActive={isActive(item.href)}
                  onClick={(e) => handleNavClick(item, e)}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div 
          className="p-4 border-t" 
          style={{ 
            borderColor: 'var(--border)',
            background: 'var(--surface)'
          }}
        >
          {/* Quick Actions */}
          <div className="mb-3 p-3 rounded-lg transition-all duration-200" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
            <div className="flex items-start gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
              >
                <HelpCircle size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  ¿Necesitas ayuda?
                </p>
                <button
                  className="text-xs flex items-center gap-1 transition-all duration-200 group"
                  style={{ color: 'var(--ot-blue-600)' }}
                  onClick={() => window.open('/docs', '_blank')}
                >
                  Ver documentación
                  <ExternalLink size={11} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group"
            style={{ 
              color: '#ef4444',
              border: '1px solid var(--border)',
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            title="Cerrar sesión"
          >
            <LogOut size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            <span>Cerrar sesión</span>
          </button>

          {/* Version Info */}
          <div className="text-center mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              © 2025 OnlyTop
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Versión 1.0.0
              </p>
            </div>
          </div>
        </div>
      </Container>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes shield-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
            filter: drop-shadow(0 0 0px rgba(59, 130, 246, 0));
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
            filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
          }
        }
      `}</style>
    </>
  );
}