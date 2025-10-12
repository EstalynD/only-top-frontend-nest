"use client";
import React from 'react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/lib/service-user/api';
import { 
  Menu, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Settings,
  ChevronDown,
  Bell,
  Search,
  Command
} from 'lucide-react';
import { RealTimeClock } from '@/components/ui/RealTimeClock';

type NavbarProps = {
  onMenuClick?: () => void;
};

type NotificationType = {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning';
};

// Mock notifications - reemplaza con datos reales
const mockNotifications: NotificationType[] = [
  {
    id: '1',
    title: 'Sistema actualizado',
    description: 'La aplicación se ha actualizado a la versión 1.0.0',
    time: 'Hace 5 min',
    isRead: false,
    type: 'info'
  },
  {
    id: '2',
    title: 'Bienvenido a OnlyTop',
    description: 'Tu cuenta ha sido configurada exitosamente',
    time: 'Hace 1 hora',
    isRead: false,
    type: 'success'
  },
  {
    id: '3',
    title: 'Recordatorio',
    description: 'Completa tu perfil para obtener mejor experiencia',
    time: 'Hace 2 horas',
    isRead: true,
    type: 'warning'
  }
];

export function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { token, setToken, ready } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [profile, setProfile] = React.useState<{ 
    username: string; 
    displayName?: string | null; 
    email?: string | null 
  } | null>(null);
  const [notifications, setNotifications] = React.useState<NotificationType[]>(mockNotifications);

  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K para abrir búsqueda
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      // Escape para cerrar menús
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setNotificationsOpen(false);
        searchRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  // Cargar perfil
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!ready || !token) {
        setProfile(null);
        return;
      }
      try {
        const res = await getProfile(token);
        if (!cancelled) {
          const u = res.user;
          setProfile({ username: u.username, displayName: u.displayName, email: u.email });
        }
      } catch {
        if (!cancelled) setProfile(null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [token, ready]);

  const displayName = profile?.displayName || profile?.username || 'Usuario';
  const email = profile?.email || '';
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationColor = (type: NotificationType['type']) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      default: return 'var(--ot-blue-500)';
    }
  };

  return (
    <header className="w-full h-16 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={onMenuClick}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border hover-surface transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Menu size={20} className="text-primary" />
        </button>

        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105 bg-ot-gradient">
            <span className="text-white font-bold text-sm">OT</span>
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="font-semibold text-sm truncate text-primary">
              OnlyTop
            </h1>
            <p className="text-xs truncate text-muted">
              Dashboard
            </p>
          </div>
        </div>

        {/* Search bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md ml-4">
          <div className="relative w-full group transition-all duration-200">
            <Search 
              size={16} 
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                searchFocused ? 'text-blue-500' : 'text-muted'
              }`}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`w-full h-10 pl-10 pr-20 rounded-lg outline-none transition-all duration-200 bg-background text-primary text-sm ${
                searchFocused 
                  ? 'border-2 border-blue-500' 
                  : 'border-2 border-border'
              }`}
            />
            <div 
              className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded bg-surface border border-border transition-opacity duration-200 ${
                searchFocused ? 'opacity-0' : 'opacity-60'
              }`}
            >
              <Command size={12} className="text-muted" />
              <span className="text-xs text-muted">K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search button - Mobile */}
        <button 
          onClick={() => searchRef.current?.focus()}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border hover-surface transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Buscar"
        >
          <Search size={18} className="text-primary" />
        </button>

        {/* Real-time clock */}
        <div className="hidden lg:flex items-center px-3 py-2 rounded-lg bg-surface-muted border border-border">
          <RealTimeClock showIcon={true} />
        </div>

        {/* Theme toggle */}
        <button 
          onClick={toggleTheme} 
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border hover-surface transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          <div className="relative w-5 h-5">
            <Sun 
              size={18} 
              className="absolute inset-0 transition-all duration-300"
              style={{
                transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
                opacity: theme === 'dark' ? 1 : 0
              }}
            />
            <Moon 
              size={18} 
              className="absolute inset-0 transition-all duration-300"
              style={{
                transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
                opacity: theme === 'light' ? 1 : 0
              }}
            />
          </div>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={handleNotificationsClick}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg ot-hover-surface transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ border: '1px solid var(--border)' }}
            aria-label="Notificaciones"
          >
            <Bell size={18} className={notificationsOpen ? 'animate-pulse' : ''} />
            {unreadCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-medium flex items-center justify-center animate-pulse"
                style={{ 
                  background: '#ef4444', 
                  color: 'white',
                  fontSize: '0.625rem'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {notificationsOpen && (
            <div
              className="fixed sm:absolute inset-x-3 sm:inset-auto top-[72px] sm:top-auto sm:right-0 sm:mt-2 z-50 w-auto sm:w-96 rounded-xl shadow-2xl ot-card border backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ 
                background: 'var(--background)', 
                borderColor: 'var(--border)',
                maxHeight: '28rem',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div 
                className="px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10"
                style={{ 
                  borderColor: 'var(--border)',
                  background: 'var(--background)'
                }}
              >
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Notificaciones
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {unreadCount} sin leer
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs px-2 py-1 rounded transition-colors duration-200"
                    style={{ 
                      color: 'var(--ot-blue-500)',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Marcar todo
                  </button>
                )}
              </div>

              {/* Notifications list */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      No hay notificaciones
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className="px-4 py-3 border-b ot-hover-surface transition-all duration-200 cursor-pointer"
                      style={{ 
                        borderColor: 'var(--border)',
                        opacity: notification.isRead ? 0.6 : 1
                      }}
                    >
                      <div className="flex gap-3">
                        <div 
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ 
                            background: notification.isRead ? 'transparent' : getNotificationColor(notification.type)
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {notification.title}
                            </p>
                            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {notification.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={handleUserMenuClick}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg ot-hover-surface transition-all duration-200 hover:scale-[1.02] active:scale-95"
            style={{ border: '1px solid var(--border)' }}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
            >
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block text-left min-w-0 max-w-[150px]">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {displayName}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {email || 'Sin correo'}
              </p>
            </div>
            <ChevronDown 
              size={16} 
              className="transition-transform duration-200 hidden sm:block"
              style={{ 
                color: 'var(--text-muted)',
                transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>

          {/* User dropdown menu */}
          {userMenuOpen && (
            <div
              role="menu"
              className="fixed sm:absolute inset-x-3 sm:inset-auto top-[72px] sm:top-auto sm:right-0 sm:mt-2 z-50 w-auto sm:w-64 rounded-xl shadow-2xl ot-card border backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ 
                background: 'var(--background)', 
                borderColor: 'var(--border)' 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* User info */}
              <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--ot-blue-500), var(--ot-blue-700))' }}
                  >
                    <User size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {displayName}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {email || 'Sin correo'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-2">
                <button
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm ot-hover-surface transition-all duration-200 group"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => router.push('/profile')}
                >
                  <User size={16} className="transition-transform duration-200 group-hover:scale-110" />
                  <span>Mi perfil</span>
                </button>
                <button
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm ot-hover-surface transition-all duration-200 group"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => router.push('/settings')}
                >
                  <Settings size={16} className="transition-transform duration-200 group-hover:rotate-45" />
                  <span>Configuración</span>
                </button>
              </div>

              {/* Logout */}
              <div className="border-t py-2" style={{ borderColor: 'var(--border)' }}>
                <button
                  role="menuitem"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm ot-hover-surface transition-all duration-200 group"
                  style={{ color: '#ef4444' }}
                >
                  <LogOut size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
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