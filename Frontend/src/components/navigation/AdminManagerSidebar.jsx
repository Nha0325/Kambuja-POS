import { NavLink } from "react-router-dom"
import {
  FaGaugeHigh,
  FaStore,
  FaUserShield,
  FaLocationDot,
  FaIdCard,
  FaBell,
  FaChartColumn,
  FaBoxesStacked,
  FaFileLines,
  FaHeartPulse,
  FaGear
} from "react-icons/fa6"
import { useTranslation } from "react-i18next";

const primaryItems = [
  { to: "/admin-manager/dashboard", labelKey: "dashboard", icon: FaGaugeHigh },
  { to: "/admin-manager/shops", labelKey: "shops", icon: FaStore },
  { to: "/admin-manager/admin-owners", labelKey: "admin_owners", icon: FaUserShield },
  { to: "/admin-manager/locations", labelKey: "locations", icon: FaLocationDot },
  { to: "/admin-manager/subscriptions", labelKey: "subscriptions", icon: FaIdCard },
  { to: "/admin-manager/alerts", labelKey: "alerts", icon: FaBell },
  { to: "/admin-manager/reports", labelKey: "reports", icon: FaChartColumn },
  { to: "/admin-manager/products", labelKey: "products_monitor", icon: FaBoxesStacked },
  { to: "/admin-manager/stock", labelKey: "global_inventory", icon: FaBoxesStacked },
  { to: "/admin-manager/system-logs", labelKey: "system_logs", icon: FaFileLines },
  { to: "/admin-manager/system-health", labelKey: "system_health", icon: FaHeartPulse },
]

const footerItems = [
  { to: "/admin-manager/settings", labelKey: "settings", icon: FaGear },
]

function AdminManagerSidebar({ isMobileOpen, isExpanded, onHover, onNavigate }) {
  const { t } = useTranslation();
  
  const navLinkClass = ({ isActive }) => (
    `${isActive ? "bg-[#06b6d4]/10 text-[#06b6d4] dark:bg-[#06b6d4]/20 dark:text-[#06b6d4] font-semibold" : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#020617] dark:text-[#a1a1aa] dark:hover:bg-[#111113] dark:hover:text-[#f8fafc] font-medium"} group relative flex h-10 w-full items-center rounded-lg transition-colors px-3 ${!isExpanded && "justify-center"}`
  )

  return (
    <aside
      onMouseEnter={() => window.innerWidth >= 1024 && onHover(true)}
      onMouseLeave={() => window.innerWidth >= 1024 && onHover(false)}
      className={`${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${isExpanded ? "w-[260px]" : "w-[72px]"} fixed inset-y-0 left-0 z-50 flex h-screen flex-col overflow-hidden border-r border-[#e5e7eb] bg-[#ffffff] transition-all duration-300 dark:border-[#27272a] dark:bg-[#111113]`}
    >
      <div className="shrink-0 flex items-center h-16 border-b border-[#e5e7eb] dark:border-[#27272a] px-4">
        <div className={`flex items-center gap-3 w-full ${!isExpanded && "justify-center"}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white overflow-hidden border border-[#e5e7eb] dark:border-none shadow-sm dark:shadow-none">
              <img src="/Logo.jpg" alt="Kambuja Logo" className="w-full h-full object-contain" />
            </div>
            <div className={`flex flex-col min-w-0 transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none hidden"}`}>
              <h1 className="truncate text-sm font-bold tracking-tight text-[#020617] dark:text-[#f8fafc]">Kambuja POS</h1>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">{t('admin_manager')}</p>
            </div>
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3 py-6 flex flex-col">
        {primaryItems.map(({ to, labelKey, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass} onClick={onNavigate}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className={`ml-3 text-sm whitespace-nowrap transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>
              {t(labelKey)}
            </span>
            {!isExpanded && (
              <div className="absolute left-14 hidden whitespace-nowrap rounded-md bg-[#020617] px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:block group-hover:opacity-100 z-50 dark:bg-white dark:text-[#020617]">
                {t(labelKey)}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 space-y-1.5 border-t border-[#e5e7eb] dark:border-[#27272a] px-3 py-4 flex flex-col">
        {footerItems.map(({ to, labelKey, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass} onClick={onNavigate}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className={`ml-3 text-sm whitespace-nowrap transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>
              {t(labelKey)}
            </span>
            {!isExpanded && (
              <div className="absolute left-14 hidden whitespace-nowrap rounded-md bg-[#020617] px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:block group-hover:opacity-100 z-50 dark:bg-white dark:text-[#020617]">
                {t(labelKey)}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}

export default AdminManagerSidebar
