import { NavLink } from "react-router-dom"
import {
  FaBuilding,
  FaChartColumn,
  FaGear,
  FaGaugeHigh,
  FaTerminal,
  FaUserShield,
  FaBoxesStacked,
  FaCashRegister,
} from "react-icons/fa6"

const primaryItems = [
  { to: "/admin-manager/dashboard", label: "Dashboard", icon: FaGaugeHigh },
  { to: "/admin-manager/shops", label: "Shops", icon: FaBuilding },
  { to: "/admin-manager/admins", label: "User Management", icon: FaUserShield },
  { to: "/admin-manager/reports", label: "Platform Reports", icon: FaChartColumn },
  { to: "/admin-manager/system-logs", label: "System Logs", icon: FaTerminal },
  { to: "/admin/inventory", label: "Stock", icon: FaBoxesStacked },
  { to: "/cashier/pos", label: "POS", icon: FaCashRegister },
]

const footerItems = [
  { to: "/admin-manager/settings", label: "Settings", icon: FaGear },
]

const navLinkClass = ({ isActive }) => (
  `${isActive ? "scale-[0.99] bg-violet-600 text-white shadow-sm shadow-violet-200" : "text-slate-600 hover:bg-violet-50 hover:text-violet-800"} flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all`
)

function AdminManagerSidebar({ isShowSidebar, onNavigate }) {
  return (
    <aside
      className={`${isShowSidebar ? "translate-x-0" : "-translate-x-full"} fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-violet-100 bg-white p-6 shadow-sm transition-transform duration-300`}
    >
      <div className="mb-10 whitespace-nowrap">
        <h1 className="text-3xl font-bold leading-tight text-slate-900">Kambuja</h1>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-violet-700">Shop Management</p>
      </div>

      <nav className="flex-1 space-y-2">
        {primaryItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass} onClick={onNavigate}>
            <Icon className="shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </nav>

      <nav className="mt-auto border-t border-violet-100 pt-6">
        {footerItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass} onClick={onNavigate}>
            <Icon className="shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default AdminManagerSidebar
