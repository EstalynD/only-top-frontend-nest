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
  Package,
  Lock,
  Power,
  Component,
} from "lucide-react";

/** =========================
 *   Tipos
 *  ========================= */
type SidebarProps = {
  variant?: "desktop" | "mobile";
  open?: boolean;
  onClose?: () => void;
};

type BasePerm = "system.admin" | "rrhh:areas:read" | "rrhh:endowment:read" | "clientes:modelos:read" | "ventas:modelos:read" | "ventas:recruitment:read" | "ventas:chatting:read" | "ventas:chatting:goals:read" | "ventas:chatting:commissions:read" | "ventas:traffic:campaigns:read" | "ventas:traffic:campaigns:create" | "ventas:traffic:campaigns:update" | "ventas:traffic:campaigns:delete" | "finanzas:read" | "finanzas:calculate" | "finanzas:approve" | "finanzas:admin" | "cartera:facturas:read" | "cartera:pagos:read" | "cartera:read";

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
  {
    type: "item",
    id: "mi-asistencia",
    href: "/mi-asistencia",
    label: "Mi Asistencia",
    icon: <Clock size={18} />,
    badge: "NEW",
    badgeColor: "#3b82f6",
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
    {
      type: "item",
      id: "rrhh-endowment",
      href: "/rrhh/endowment",
      label: "Dotación",
      icon: <Package size={16} />,
      requiresPermission: "rrhh:endowment:read",
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

const COMPONENTS_GROUP: NavGroup = {
  id: "componentes",
  label: "Componentes",
  icon: <Component size={18} />,
  children: [
    {
      type: "item",
      id: "components-buttons",
      href: "/componentes/buttons",
      label: "Buttons",
      icon: <Component size={16} />,
      badge: "NEW",
      badgeColor: "#10b981",
    },
    {
      type: "item",
      id: "components-modals",
      href: "/componentes/modals",
      label: "Modals",
      icon: <Component size={16} />,
      badge: "NEW",
      badgeColor: "#3b82f6",
    },
    {
      type: "item",
      id: "components-loaders",
      href: "/componentes/loaders",
      label: "Loaders",
      icon: <Component size={16} />,
      badge: "NEW",
      badgeColor: "#8b5cf6",
    },
    {
      type: "item",
      id: "components-forms",
      href: "/componentes/forms",
      label: "Forms",
      icon: <Component size={16} />,
      badge: "NEW",
      badgeColor: "#10b981",
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

  // Estilos por nivel
  const paddingLeft = level === 0 ? "pl-3" : level === 1 ? "pl-6" : "pl-9";
  const textSize = "text-sm";
  const iconSize = level === 0 ? 18 : 16;

  return (
    <Comp
      href={disabled ? undefined : item.href}
      onClick={onClick}
      aria-disabled={disabled || undefined}
      title={disabled ? "Próximamente disponible" : undefined}
      className={`
        group relative flex items-center gap-3 ${paddingLeft} pr-3 py-2.5 
        rounded-lg ${textSize} font-medium transition-all duration-150
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${!disabled && !isActive ? "text-primary hover-surface" : ""}
        ${isActive ? "font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : ""}
      `}
    >
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
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {item.badge}
        </span>
      )}

      {/* Disabled badge */}
      {disabled && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
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
        className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
          highlight 
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
            : "text-primary hover-surface"
        }`}
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
        className={`group w-full flex items-center justify-between ${paddingLeft} pr-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-150 ${
          anyActive 
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
            : "text-muted hover-surface"
        }`}
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
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [systemOpen, setSystemOpen] = React.useState(false);
  const [rrhhOpen, setRrhhOpen] = React.useState(false);
  const [clientesOpen, setClientesOpen] = React.useState(false);
  const [finanzasOpen, setFinanzasOpen] = React.useState(false);
  const [ventasOpen, setVentasOpen] = React.useState(false);
  const [configOpen, setConfigOpen] = React.useState(false);
  const [componentsOpen, setComponentsOpen] = React.useState(false);

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

  // Cargar permisos del usuario y perfil
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!ready || !token) {
        if (!cancelled) {
          setPerms(new Set());
          setUserProfile(null);
        }
        return;
      }
      try {
        const me = await getProfile(token);
        const p = new Set<string>((me.user?.permissions ?? []) as string[]);
        if (!cancelled) {
          setPerms(p);
          setUserProfile(me.user);
        }
      } catch {
        if (!cancelled) {
          setPerms(new Set());
          setUserProfile(null);
        }
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

    const componentsActive = COMPONENTS_GROUP.children.some((c) => c.type === "item" && isActive(c.href));
    if (componentsActive) setComponentsOpen(true);
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

      <nav className={`pc-sidebar sidebar-width flex flex-col bg-surface border-r border-border ${
        variant === "desktop" 
          ? "h-full" 
          : ""
      }`} style={mobileStyles}>
        <div className="navbar-wrapper flex flex-col h-full">
          {/* Header - Solo botón de cerrar en móvil */}
          {variant === "mobile" && (
            <div className="m-header flex items-center justify-end py-4 px-6 h-16 border-b border-border">
              <button
                onClick={onClose}
                aria-label="Cerrar menú"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover-surface transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="navbar-content flex-1 py-4 overflow-y-auto">
            {/* Navigation */}
            <ul className="pc-navbar px-3 space-y-1">
              {/* Principal */}
              {MAIN_NAV_ITEMS.length > 0 && (
                <>
                  {MAIN_NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      <NavLinkItem
                        item={item}
                        isActive={isActive(item.href)}
                        onClick={(e) => handleNavClick(item, e)}
                        level={0}
                      />
                    </li>
                  ))}
                </>
              )}

              {/* Administración */}
              {systemFiltered && (
                <li>
                  <NavGroupComponent
                    group={systemFiltered}
                    isOpen={systemOpen}
                    onToggle={() => setSystemOpen((v) => !v)}
                    onItemClick={handleNavClick}
                    hasAnyChildActive={groupHasActive(systemFiltered)}
                  />
                </li>
              )}

              {/* RRHH */}
              {rrhhFiltered && (
                <li>
                  <NavGroupComponent
                    group={rrhhFiltered}
                    isOpen={rrhhOpen}
                    onToggle={() => setRrhhOpen((v) => !v)}
                    onItemClick={handleNavClick}
                    hasAnyChildActive={groupHasActive(rrhhFiltered)}
                  />
                </li>
              )}

              {/* Clientes */}
              {clientesFiltered && (
                <li>
                  <NavGroupComponent
                    group={clientesFiltered}
                    isOpen={clientesOpen}
                    onToggle={() => setClientesOpen((v) => !v)}
                    onItemClick={handleNavClick}
                    hasAnyChildActive={groupHasActive(clientesFiltered)}
                  />
                </li>
              )}

              {/* Finanzas */}
              {finanzasFiltered && (
                <li>
                  <NavGroupComponent
                    group={finanzasFiltered}
                    isOpen={finanzasOpen}
                    onToggle={() => setFinanzasOpen((v) => !v)}
                    onItemClick={handleNavClick}
                    hasAnyChildActive={groupHasActive(finanzasFiltered)}
                  />
                </li>
              )}

              {/* Ventas */}
              {ventasFiltered && (
                <li>
                  <NavGroupComponent
                    group={ventasFiltered}
                    isOpen={ventasOpen}
                    onToggle={() => setVentasOpen((v) => !v)}
                    onItemClick={handleNavClick}
                    hasAnyChildActive={groupHasActive(ventasFiltered)}
                  />
                </li>
              )}

              {/* Configuración */}
              <li>
                <NavGroupComponent
                  group={CONFIG_GROUP}
                  isOpen={configOpen}
                  onToggle={() => setConfigOpen((v) => !v)}
                  onItemClick={handleNavClick}
                  hasAnyChildActive={groupHasActive(CONFIG_GROUP)}
                />
              </li>

              {/* Componentes */}
              <li>
                <NavGroupComponent
                  group={COMPONENTS_GROUP}
                  isOpen={componentsOpen}
                  onToggle={() => setComponentsOpen((v) => !v)}
                  onItemClick={handleNavClick}
                  hasAnyChildActive={groupHasActive(COMPONENTS_GROUP)}
                />
              </li>

              {/* Personal */}
              {BOTTOM_NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <NavLinkItem
                    item={item}
                    isActive={isActive(item.href)}
                    onClick={(e) => handleNavClick(item, e)}
                    level={0}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* User Info - Fixed at bottom */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <img 
                className="shrink-0 w-10 h-10 rounded-full border-2 border-border" 
                src={userProfile?.avatarUrl || "/api/placeholder/40/40"} 
                alt="user-image" 
              />
              <div className="min-w-0 flex-1">
                <h6 className="text-sm font-semibold text-primary truncate">
                  {userProfile?.displayName || userProfile?.username || "Usuario"}
                </h6>
                <p className="text-xs text-muted truncate">
                  {userProfile?.roles?.[0] || "Usuario"}
                </p>
              </div>
              <button 
                onClick={logout}
                className="shrink-0 p-2 rounded-lg hover-surface transition-colors"
                title="Cerrar sesión"
              >
                <Power size={16} className="text-muted hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>

        </div>
      </nav>
    </>
  );
}
