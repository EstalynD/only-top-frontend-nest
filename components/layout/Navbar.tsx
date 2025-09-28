"use client";
import React from 'react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Settings,
  ChevronDown,
  Bell
} from 'lucide-react';

type NavbarProps = {
  onMenuClick?: () => void;
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { setToken } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
      setNotificationsOpen(false);
    };

    if (userMenuOpen || notificationsOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen, notificationsOpen]);

  const logout = React.useCallback(() => {
    setToken(null);
    router.replace('/login');
  }, [router, setToken]);

  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserMenuOpen((prev) => !prev);
    setNotificationsOpen(false);
  };

  const handleNotificationsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationsOpen((prev) => !prev);
    setUserMenuOpen(false);
  };

  return (
    <header
      className="w-full h-16 border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 backdrop-blur-md"
      style={{ 
        background: 'var(--surface)', 
        borderColor: 'var(--border)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Branding - always visible in top-left corner */}
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
          >
            <span className="text-white font-bold text-sm">OT</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              OnlyTop
            </h1>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={onMenuClick}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg ot-hover-surface transition-colors"
          style={{ border: '1px solid var(--border)' }}
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb or page title (desktop) */}
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Bienvenido al panel de control
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme} 
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg ot-hover-surface transition-colors"
          style={{ border: '1px solid var(--border)' }}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={handleNotificationsClick}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg ot-hover-surface transition-colors"
            style={{ border: '1px solid var(--border)' }}
            aria-label="Notificaciones"
          >
            <Bell size={18} />
            {/* Notification badge */}
            <span 
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center"
              style={{ background: '#ef4444', color: 'white' }}
            >
              <span className="sr-only">3 notificaciones nuevas</span>
            </span>
          </button>

          {/* Notifications dropdown */}
          {notificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg py-2 ot-card border"
              style={{ 
                background: 'var(--background)', 
                borderColor: 'var(--border)',
                maxHeight: '24rem',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  Notificaciones
                </h3>
              </div>
              <div className="py-2">
                <div className="px-4 py-3 ot-hover-surface">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Sistema actualizado
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    La aplicación se ha actualizado a la versión 1.0.0
                  </p>
                </div>
                <div className="px-4 py-3 ot-hover-surface">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Bienvenido a OnlyTop
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Tu cuenta ha sido configurada exitosamente
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={handleUserMenuClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg ot-hover-surface transition-colors"
            style={{ border: '1px solid var(--border)' }}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
            >
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                Administrador
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                admin@onlytop.com
              </p>
            </div>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-muted)' }}
            />
          </button>

          {/* User dropdown menu */}
          {userMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-2 ot-card border"
              style={{ 
                background: 'var(--background)', 
                borderColor: 'var(--border)' 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* User info */}
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Administrador
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  admin@onlytop.com
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm ot-hover-surface transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <User size={16} />
                  <span>Mi perfil</span>
                </button>
                <button
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm ot-hover-surface transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Settings size={16} />
                  <span>Configuración</span>
                </button>
              </div>

              {/* Logout */}
              <div className="border-t py-1" style={{ borderColor: 'var(--border)' }}>
                <button
                  role="menuitem"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm ot-hover-surface transition-colors"
                  style={{ color: '#ef4444' }}
                >
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
