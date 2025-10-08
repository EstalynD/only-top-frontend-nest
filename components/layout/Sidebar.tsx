"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProfile } from "@/lib/service-user/api";
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
  Mail,
  DollarSign,
  Clock,
  HelpCircle,
  UserCheck,
  Building2,
  UsersRound,
  TrendingUp,
  Target,
  MessageCircle,
} from "lucide-react";

/** =========================
 *   Tipos
 *  ========================= */
type SidebarProps = {
  variant?: "desktop" | "mobile";
  open?: boolean;
  onClose?: () => void;
};

type BasePerm = "system.admin" | "rrhh:areas:read" | "clientes:modelos:read" | "ventas:modelos:read" | "ventas:recruitment:read" | "ventas:chatting:read" | "ventas:chatting:goals:read" | "ventas:chatting:commissions:read" | "ventas:traffic:campaigns:read" | "ventas:traffic:campaigns:create" | "ventas:traffic:campaigns:update" | "ventas:traffic:campaigns:delete" | "finanzas:read" | "finanzas:calculate" | "finanzas:approve" | "finanzas:admin" | "cartera:facturas:read" | "cartera:pagos:read" | "cartera:read";

type NavItem = {
  type: "item";
  id: string;
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  badge?: string;
  badgeColor?: string;
  requiresPermission?: BasePerm | BasePerm[];
  hasChildren?: boolean; // Indica si el item tiene subniveles (muestra chevron)
};

type NavSection = {
  type: "section";
  id: string;
  label: string;
  children: NavItem[];
};

type NavGroup = {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: (NavItem | NavSection)[];
  requiresPermission?: BasePerm | BasePerm[];
};

/** =========================
 *   Definición de navegación
 *  ========================= */
const MAIN_NAV_ITEMS: NavItem[] = [
  {
    type: "item",
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    badge: "Nuevo",
    badgeColor: "#10b981",
  },



];

const SYSTEM_GROUP: NavGroup = {
  id: "sistema",
  label: "Sistema",
  icon: <Shield size={18} />,
  requiresPermission: "system.admin",
  children: [
    {
      type: "item",
      id: "gestionar-roles",
      href: "/admin/rbac/roles",
      label: "Gestionar roles",
      icon: <Shield size={16} />,
    },
    {
      type: "item",
      id: "gestionar-usuarios",
      href: "/admin/users",
      label: "Usuarios",
      icon: <Users size={16} />,
    },
  ],
};

const RRHH_GROUP: NavGroup = {
  id: "rrhh",
  label: "Recursos Humanos",
  icon: <UserCheck size={18} />,
  requiresPermission: "rrhh:areas:read",
  children: [
    {
      type: "item",
      id: "rrhh-areas",
      href: "/rrhh/areas",
      label: "Áreas y Cargos",
      icon: <Building2 size={16} />,
    },
    {
      type: "item",
      id: "rrhh-empleados",
      href: "/rrhh/empleados",
      label: "Empleados",
      icon: <Users size={16} />,
    },
    {
      type: "item",
      id: "rrhh-horas-extras",
      href: "/rrhh/horas-extras",
      label: "Horas Extras",
      icon: <Clock size={16} />,
    },
    {
      type: "item",
      id: "rrhh-attendance",
      href: "/rrhh/attendance",
      label: "Control de Asistencia",
      icon: <Clock size={16} />,
    },
  ],
};

const CLIENTES_GROUP: NavGroup = {
  id: "clientes",
  label: "Clientes",
  icon: <UsersRound size={18} />,
  requiresPermission: "clientes:modelos:read",
  children: [
    {
      type: "item",
      id: "clientes-modelos",
      href: "/clientes/modelos",
      label: "Modelos",
      icon: <UsersRound size={16} />,
    },
    {
      type: "item",
      id: "clientes-modelos-ventas",
      href: "/clientes/modelos-ventas",
      label: "Ventas de Modelos",
      icon: <TrendingUp size={16} />,
      requiresPermission: "ventas:modelos:read",
      badge: "NEW",
      badgeColor: "#10b981",
    },
    {
      type: "item",
      id: "clientes-contratos",
      href: "/clientes/contratos",
      label: "Contratos",
      icon: <FileText size={16} />,
    },
  ],
};

const FINANZAS_GROUP: NavGroup = {
  id: "finanzas",
  label: "Finanzas",
  icon: <DollarSign size={18} />,
  requiresPermission: "finanzas:read",
  children: [
    {
      type: "item",
      id: "finanzas-dashboard",
      href: "/finanzas",
      label: "Dashboard",
      icon: <LayoutDashboard size={16} />,
    },
    {
      type: "item",
      id: "finanzas-bank",
      href: "/finanzas/bank",
      label: "BANK",
      icon: <DollarSign size={16} />,
      badge: "NEW",
      badgeColor: "#10b981",
    },
    {
      type: "item",
      id: "finanzas-periodos",
      href: "/finanzas/periodos",
      label: "Periodos Consolidados",
      icon: <BarChart3 size={16} />,
    },
    {
      type: "item",
      id: "finanzas-costos-fijos",
      href: "/finanzas/costos-fijos",
      label: "Costos Fijos",
      icon: <FileText size={16} />,
      badge: "NEW",
      badgeColor: "#8b5cf6",
    },
    {
      type: "item",
      id: "finanzas-gastos-fijos",
      href: "/finanzas/gastos-fijos",
      label: "Gastos Fijos Quincenales",
      icon: <FileText size={16} />,
      badge: "NEW",
      badgeColor: "#10b981",
    },
    {
      type: "item",
      id: "cartera",
      href: "/cartera",
      label: "Cartera",
      icon: <DollarSign size={16} />,
      badge: "NEW",
      badgeColor: "#3b82f6",
      requiresPermission: "cartera:read",
    },
  ],
};

const VENTAS_GROUP: NavGroup = {
  id: "ventas",
  label: "Ventas",
  icon: <TrendingUp size={18} />,
  children: [
    {
      type: "section",
      id: "ventas-chatters-section",
      label: "Chatters",
      children: [
        {
          type: "item",
          id: "ventas-chatting",
          href: "/ventas/chatting",
          label: "Ventas",
          icon: <MessageCircle size={16} />,
          requiresPermission: "ventas:chatting:read",
        },
        {
          type: "item",
          id: "ventas-chatting-grupos",
          href: "/ventas/chatting/grupos",
          label: "Análisis de grupos",
          icon: <Users size={16} />,
          requiresPermission: "ventas:chatting:read",
        },
        {
          type: "item",
          id: "ventas-chatting-metas",
          href: "/ventas/chatting/metas",
          label: "Metas",
          icon: <Target size={16} />,
          requiresPermission: "ventas:chatting:goals:read",
        },
        {
          type: "item",
          id: "ventas-chatting-comisiones",
          href: "/ventas/chatting/comisiones",
          label: "Comisiones",
          icon: <DollarSign size={16} />,
          requiresPermission: "ventas:chatting:commissions:read",
        },
      ],
    },
    {
      type: "section",
      id: "ventas-recruitment-section",
      label: "Recruitment",
      children: [
        {
          type: "item",
          id: "ventas-recruitment",
          href: "/ventas/recruitment",
          label: "Ventas",
          icon: <Target size={16} />,
          requiresPermission: "ventas:recruitment:read",
        },
        {
          type: "item",
          id: "ventas-stats",
          href: "/ventas/recruitment/stats",
          label: "Estadísticas",
          icon: <BarChart3 size={16} />,
          requiresPermission: "ventas:recruitment:read",
        },
        {
          type: "item",
          id: "ventas-metas",
          href: "/ventas/recruitment/metas",
          label: "Metas",
          icon: <Target size={16} />,
          requiresPermission: "ventas:recruitment:read",
        },
      ],
    },
    {
      type: "section",
      id: "ventas-traffic-section",
      label: "Traffic / Trafficker",
      children: [
        {
          type: "item",
          id: "ventas-traffic",
          href: "/ventas/traffic",
          label: "Campañas",
          icon: <TrendingUp size={16} />,
          requiresPermission: "ventas:traffic:campaigns:read",
        },
      ],
    },
  ],
};

const CONFIG_GROUP: NavGroup = {
  id: "configuracion",
  label: "Configuración",
  icon: <Settings size={18} />,
  children: [
    {
      type: "item",
      id: "config-general",
      href: "/configuracion",
      label: "General",
      icon: <Settings size={16} />,
    },
    {
      type: "item",
      id: "config-email",
      href: "/configuracion/email",
      label: "Email",
      icon: <Mail size={16} />,
    },
    {
      type: "item",
      id: "config-finanzas",
      href: "/configuracion/finanzas",
      label: "Finanzas",
      icon: <DollarSign size={16} />,
    },
    {
      type: "item",
      id: "config-asistencia",
      href: "/configuracion/asistencia",
      label: "Asistencia",
      icon: <Clock size={16} />,
    },
  ],
};

const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    type: "item",
    id: "mi-perfil",
    href: "/profile",
    label: "Mi perfil",
    icon: <UserIcon size={18} />,
  },
  {
    type: "item",
    id: "ayuda",
    href: "/ayuda",
    label: "Ayuda",
    icon: <HelpCircle size={18} />,
    disabled: true,
  },
];

/** =========================
 *   Utils
 *  ========================= */
const toArray = (x?: BasePerm | BasePerm[]) => (Array.isArray(x) ? x : x ? [x] : []);

/** =========================
 *   Componentes atómicos
 *  ========================= */
function useIsActive() {
  const pathname = usePathname();
  return React.useCallback(
    (href: string) => {
      if (!href || href === "#") return false;
      try {
        if (pathname === href) return true;
        if (href === "/configuracion") return pathname === "/configuracion";
        return href !== "/" && pathname?.startsWith(href);
      } catch {
        return false;
      }
    },
    [pathname]
  );
}

function NavLinkItem({
  item,
  isActive,
  onClick,
  level = 0,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: (e: React.MouseEvent) => void;
  level?: number;
}) {
  const disabled = item.disabled;
  const Comp: any = disabled ? "div" : Link;

  // Estilos por nivel - diseño minimalista
  const paddingLeft = level === 0 ? "pl-3" : level === 1 ? "pl-6" : "pl-9";
  const textSize = level === 0 ? "text-sm" : "text-sm";
  const iconSize = level === 0 ? 18 : 16;

  return (
    <Comp
      href={disabled ? undefined : item.href}
      onClick={onClick}
      aria-disabled={disabled || undefined}
      title={disabled ? "Próximamente disponible" : undefined}
      className={`
        group relative flex items-center gap-3 ${paddingLeft} pr-3 py-2 
        rounded-lg ${textSize} font-medium transition-all duration-150
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${!disabled && !isActive ? "ot-theme-text hover:ot-hover-surface" : ""}
        ${isActive ? "font-semibold" : ""}
      `}
      style={{
        background: isActive ? 'var(--surface-muted)' : 'transparent',
        color: isActive ? 'var(--ot-blue-500)' : undefined
      }}
    >
      {/* Indicador de activo */}
      {isActive && (
        <span 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
          style={{ background: 'var(--ot-blue-500)' }}
          aria-hidden="true"
        />
      )}

      {/* Icono */}
      <span className="shrink-0">
        {React.cloneElement(item.icon as React.ReactElement, { 
          size: iconSize,
          strokeWidth: isActive ? 2.5 : 2
        } as any)}
      </span>
      
      {/* Label */}
      <span className="truncate flex-1">
        {item.label}
      </span>

      {/* Badge */}
      {item.badge && !disabled && (
        <span 
          className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
          style={{ 
            background: 'var(--ot-blue-50)',
            color: 'var(--ot-blue-500)'
          }}
        >
          {item.badge}
        </span>
      )}

      {/* Disabled badge */}
      {disabled && (
        <span 
          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
          style={{ 
            background: 'var(--surface-muted)',
            color: 'var(--text-muted)'
          }}
        >
          Pronto
        </span>
      )}
    </Comp>
  );
}

/** Collapsible - diseño minimalista */
function Collapsible({
  label,
  leadingIcon,
  open,
  onToggle,
  highlight,
  children,
  ariaId,
}: {
  label: string;
  leadingIcon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  highlight?: boolean;
  children: React.ReactNode;
  ariaId: string;
}) {
  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={ariaId}
        className="group w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ot-theme-text hover:ot-hover-surface"
        style={{
          background: highlight ? 'var(--surface-muted)' : 'transparent',
          color: highlight ? 'var(--ot-blue-500)' : undefined
        }}
      >
        <span className="flex items-center gap-3">
          <span className="shrink-0">
            {leadingIcon}
          </span>
          <span>{label}</span>
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>

      <div
        id={ariaId}
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

/** Grupo de navegación */
function NavGroupComponent({
  group,
  isOpen,
  onToggle,
  onItemClick,
  hasAnyChildActive,
  level = 0,
}: {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: (item: NavItem, e: React.MouseEvent) => void;
  hasAnyChildActive: boolean;
  level?: number;
}) {
  const isActive = useIsActive();

  return (
    <div>
      <Collapsible
        label={group.label}
        leadingIcon={group.icon}
        open={isOpen}
        onToggle={onToggle}
        highlight={hasAnyChildActive}
        ariaId={`grp-${group.id}`}
      >
        <div className="mt-1 space-y-0.5">
          {group.children.map((child) =>
            child.type === "item" ? (
              <NavLinkItem
                key={child.id}
                item={child}
                isActive={isActive(child.href)}
                onClick={(e) => onItemClick(child, e)}
                level={level + 1}
              />
            ) : (
              <SectionComponent
                key={child.id}
                section={child}
                onItemClick={onItemClick}
                level={level + 1}
              />
            )
          )}
        </div>
      </Collapsible>
    </div>
  );
}

/** Sección con subitems */
function SectionComponent({
  section,
  onItemClick,
  level = 1,
}: {
  section: NavSection;
  onItemClick: (item: NavItem, e: React.MouseEvent) => void;
  level?: number;
}) {
  const isActive = useIsActive();
  const [open, setOpen] = React.useState(false);

  // Autoabrir si algún hijo está activo
  React.useEffect(() => {
    if (section.children.some((c) => isActive(c.href))) setOpen(true);
  }, [section, isActive]);

  const anyActive = section.children.some((c) => isActive(c.href));
  const paddingLeft = level === 1 ? "pl-3" : "pl-6";

  return (
    <div className="space-y-0.5">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`sec-${section.id}`}
        className={`group w-full flex items-center justify-between ${paddingLeft} pr-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-150 ot-theme-text-muted hover:ot-hover-surface`}
        style={{
          background: anyActive ? 'var(--surface-muted)' : 'transparent',
          color: anyActive ? 'var(--ot-blue-500)' : undefined
        }}
      >
        <span>{section.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>

      {/* Section items */}
      <div
        id={`sec-${section.id}`}
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="space-y-0.5 mt-0.5">
            {section.children.map((child) => (
              <NavLinkItem
                key={child.id}
                item={child}
                isActive={isActive(child.href)}
                onClick={(e) => onItemClick(child, e)}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** =========================
 *   Sidebar
 *  ========================= */
export function Sidebar({ variant = "desktop", open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isActive = useIsActive();
  const { setToken, token, ready } = useAuth();
  const router = useRouter();

  const [perms, setPerms] = React.useState<Set<string>>(new Set());
  const [systemOpen, setSystemOpen] = React.useState(false);
  const [rrhhOpen, setRrhhOpen] = React.useState(false);
  const [clientesOpen, setClientesOpen] = React.useState(false);
  const [finanzasOpen, setFinanzasOpen] = React.useState(false);
  const [ventasOpen, setVentasOpen] = React.useState(false);
  const [configOpen, setConfigOpen] = React.useState(false);

  const Container: any = variant === "mobile" ? "div" : "aside";
  const mobileStyles =
    variant === "mobile"
      ? {
          position: "fixed" as const,
          top: 0,
          bottom: 0,
          left: 0,
          width: "18rem",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 50,
          boxShadow: open
            ? "0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04)"
            : "none",
        }
      : undefined;

  const logout = React.useCallback(() => {
    setToken(null);
    router.replace("/login");
  }, [router, setToken]);

  // Cargar permisos del usuario
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!ready || !token) {
        if (!cancelled) setPerms(new Set());
        return;
      }
      try {
        const me = await getProfile(token);
        const p = new Set<string>((me.user?.permissions ?? []) as string[]);
        if (!cancelled) setPerms(p);
      } catch {
        if (!cancelled) setPerms(new Set());
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token, ready]);

  /** Filtro de permisos centralizado */
  const can = React.useCallback(
    (required?: BasePerm | BasePerm[]) => {
      const req = toArray(required);
      if (req.length === 0) return true;
      return req.some((r) => perms.has(r));
    },
    [perms]
  );

  const filterGroup = React.useCallback(
    (group: NavGroup): NavGroup | null => {
      if (!can(group.requiresPermission)) return null;

      const filteredChildren = group.children
        .map((child) => {
          if (child.type === "item") {
            if (!can(child.requiresPermission)) return null;
            return child;
          }
          // section
          const secItems = child.children.filter((it) => can(it.requiresPermission));
          if (secItems.length === 0) return null;
          return { ...child, children: secItems };
        })
        .filter(Boolean) as (NavItem | NavSection)[];

      if (filteredChildren.length === 0) return null;
      return { ...group, children: filteredChildren };
    },
    [can]
  );

  const ventasFiltered = React.useMemo(() => filterGroup(VENTAS_GROUP), [filterGroup]);
  const systemFiltered = React.useMemo(() => filterGroup(SYSTEM_GROUP), [filterGroup]);
  const rrhhFiltered = React.useMemo(() => filterGroup(RRHH_GROUP), [filterGroup]);
  const clientesFiltered = React.useMemo(() => filterGroup(CLIENTES_GROUP), [filterGroup]);
  const finanzasFiltered = React.useMemo(() => filterGroup(FINANZAS_GROUP), [filterGroup]);

  // Auto-expand por ruta activa
  React.useEffect(() => {
    if (systemFiltered?.children.some((c) => c.type === "item" && isActive(c.href))) setSystemOpen(true);
    if (rrhhFiltered?.children.some((c) => c.type === "item" && isActive(c.href))) setRrhhOpen(true);
    if (clientesFiltered?.children.some((c) => c.type === "item" && isActive(c.href))) setClientesOpen(true);
    if (finanzasFiltered?.children.some((c) => c.type === "item" && isActive(c.href))) setFinanzasOpen(true);

    const anyVentasActive =
      ventasFiltered?.children.some((c) =>
        c.type === "item"
          ? isActive(c.href)
          : c.children.some((it) => isActive(it.href))
      ) ?? false;
    if (anyVentasActive) setVentasOpen(true);

    const configActive = CONFIG_GROUP.children.some((c) => c.type === "item" && isActive(c.href));
    if (configActive) setConfigOpen(true);
  }, [pathname, systemFiltered, rrhhFiltered, clientesFiltered, finanzasFiltered, ventasFiltered, isActive]);

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    if (variant === "mobile") onClose?.();
  };

  const groupHasActive = (group: NavGroup | null | undefined) => {
    if (!group) return false;
    return group.children.some((c) =>
      c.type === "item" ? isActive(c.href) : c.children.some((it) => isActive(it.href))
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {variant === "mobile" && open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <Container
        className={`w-72 flex flex-col ot-theme-surface ${
          variant === "desktop" 
            ? "border-r ot-theme-border sticky top-16 h-[calc(100dvh-4rem)]" 
            : ""
        }`}
        style={mobileStyles}
        aria-label="Sidebar navigation"
      >
        {/* Header - solo mobile */}
        {variant === "mobile" && (
          <div className="h-16 flex items-center justify-between px-4 border-b ot-theme-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--ot-blue-500)' }}>
                <span className="text-white font-bold text-sm">OT</span>
              </div>
              <div>
                <h2 className="text-sm font-bold ot-theme-text">
                  OnlyTop
                </h2>
                <p className="text-xs ot-theme-text-muted">
                  Panel de control
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar menú"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border ot-theme-border ot-theme-text-muted hover:ot-hover-surface transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden sidebar-scroll">
          {/* Principal */}
          {MAIN_NAV_ITEMS.length > 0 && (
            <div className="space-y-1">
              {MAIN_NAV_ITEMS.map((item) => (
                <NavLinkItem
                  key={item.id}
                  item={item}
                  isActive={isActive(item.href)}
                  onClick={(e) => handleNavClick(item, e)}
                  level={0}
                />
              ))}
            </div>
          )}

          {/* Divider */}
          {MAIN_NAV_ITEMS.length > 0 && <div className="border-t ot-theme-border" />}

          {/* Administración */}
          {systemFiltered && (
            <NavGroupComponent
              group={systemFiltered}
              isOpen={systemOpen}
              onToggle={() => setSystemOpen((v) => !v)}
              onItemClick={handleNavClick}
              hasAnyChildActive={groupHasActive(systemFiltered)}
            />
          )}

          {/* RRHH */}
          {rrhhFiltered && (
            <NavGroupComponent
              group={rrhhFiltered}
              isOpen={rrhhOpen}
              onToggle={() => setRrhhOpen((v) => !v)}
              onItemClick={handleNavClick}
              hasAnyChildActive={groupHasActive(rrhhFiltered)}
            />
          )}

          {/* Clientes */}
          {clientesFiltered && (
            <NavGroupComponent
              group={clientesFiltered}
              isOpen={clientesOpen}
              onToggle={() => setClientesOpen((v) => !v)}
              onItemClick={handleNavClick}
              hasAnyChildActive={groupHasActive(clientesFiltered)}
            />
          )}

          {/* Finanzas */}
          {finanzasFiltered && (
            <NavGroupComponent
              group={finanzasFiltered}
              isOpen={finanzasOpen}
              onToggle={() => setFinanzasOpen((v) => !v)}
              onItemClick={handleNavClick}
              hasAnyChildActive={groupHasActive(finanzasFiltered)}
            />
          )}

          {/* Ventas */}
          {ventasFiltered && (
            <NavGroupComponent
              group={ventasFiltered}
              isOpen={ventasOpen}
              onToggle={() => setVentasOpen((v) => !v)}
              onItemClick={handleNavClick}
              hasAnyChildActive={groupHasActive(ventasFiltered)}
            />
          )}

          {/* Configuración */}
          <NavGroupComponent
            group={CONFIG_GROUP}
            isOpen={configOpen}
            onToggle={() => setConfigOpen((v) => !v)}
            onItemClick={handleNavClick}
            hasAnyChildActive={groupHasActive(CONFIG_GROUP)}
          />

          {/* Divider */}
          <div className="border-t ot-theme-border" />

          {/* Personal */}
          <div className="space-y-1">
            {BOTTOM_NAV_ITEMS.map((item) => (
              <NavLinkItem
                key={item.id}
                item={item}
                isActive={isActive(item.href)}
                onClick={(e) => handleNavClick(item, e)}
                level={0}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t ot-theme-border ot-theme-surface">
          {/* Logout button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ 
              color: '#ef4444',
              '--hover-bg': 'rgba(239, 68, 68, 0.1)'
            } as any}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title="Cerrar sesión"
          >
            <LogOut size={18} strokeWidth={2} />
            <span>Cerrar sesión</span>
          </button>

          {/* Version info */}
          <div className="text-center mt-4 pt-4 border-t ot-theme-border">
            <p className="text-xs ot-theme-text-muted">
              © 2025 OnlyTop · v1.0.0
            </p>
          </div>
        </div>
      </Container>

      {/* Estilos para scrollbar */}
      <style jsx global>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
      `}</style>
    </>
  );
}
