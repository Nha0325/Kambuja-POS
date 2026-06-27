import { NavLink } from "react-router-dom"
import {
  FaCashRegister,
  FaClockRotateLeft,
  FaUser,
  FaClipboardList,
  FaLock,
  FaMagnifyingGlass,
  FaBoxesStacked,
  FaFileInvoiceDollar,
  FaRegCalendarCheck,
} from "react-icons/fa6";
import { TbLogout2 } from "react-icons/tb";
import useSignout from "../../hooks/auth/useSignout";

const items = [
  { to: "/cashier/pos", label: "POS", icon: FaCashRegister },
  { to: "/cashier/hold-orders", label: "Hold Bills", icon: FaClipboardList },
  { to: "/cashier/sales-today", label: "Today Sales", icon: FaRegCalendarCheck },
  { to: "/cashier/sales-history", label: "Sales History", icon: FaClockRotateLeft },
  { to: "/cashier/stock-check", label: "Stock Check", icon: FaBoxesStacked },
  { to: "/cashier/stock-lookup", label: "Stock Lookup", icon: FaMagnifyingGlass },
  { to: "/cashier/receipts", label: "Receipts", icon: FaFileInvoiceDollar },
  { to: "/cashier/daily-close", label: "Daily Close", icon: FaLock },
  { to: "/cashier/profile", label: "Profile", icon: FaUser },
];

function CashierSidebar({ isMobileOpen, isExpanded, onHover, onNavigate }) {
  const { signout } = useSignout()

  const handleSignout = async () => {
    await signout()
    window.location.href = '/login'
  }

  const navLinkClass = ({ isActive }) => (
    `${isActive ? "bg-[#7033ff]/10 text-[#7033ff] dark:bg-[#7033ff]/20 dark:text-[#7033ff] font-semibold" : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#020617] dark:text-[#a1a1aa] dark:hover:bg-[#111113] dark:hover:text-[#f8fafc] font-medium"} group relative flex h-10 w-full items-center rounded-lg transition-colors px-3 ${!isExpanded && "justify-center"}`
  )

  return (
    <aside
      onMouseEnter={() => window.innerWidth >= 1024 && onHover(true)}
      onMouseLeave={() => window.innerWidth >= 1024 && onHover(false)}
      className={`${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${isExpanded ? "w-[240px]" : "w-[72px]"} fixed inset-y-0 left-0 z-50 flex h-screen flex-col overflow-hidden border-r border-[#e5e7eb] bg-[#ffffff] transition-all duration-300 dark:border-[#27272a] dark:bg-[#09090b]`}
    >
      <div className="shrink-0 flex items-center h-16 border-b border-[#e5e7eb] dark:border-[#27272a] px-4">
        <div className={`flex items-center gap-3 w-full ${!isExpanded && "justify-center"}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7033ff] text-sm font-bold text-white shadow-sm dark:shadow-none">
              KP
            </div>
            <div className={`flex flex-col min-w-0 transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none hidden"}`}>
              <h1 className="truncate text-sm font-bold tracking-tight text-[#020617] dark:text-[#f8fafc]">Kambuja POS</h1>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b] dark:text-[#a1a1aa]">Cashier</p>
            </div>
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3 py-6 flex flex-col">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass} onClick={onNavigate}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className={`ml-3 text-sm whitespace-nowrap transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>
              {label}
            </span>
            {!isExpanded && (
              <div className="absolute left-14 hidden whitespace-nowrap rounded-md bg-[#020617] px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:block group-hover:opacity-100 z-50 dark:bg-white dark:text-[#020617]">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 space-y-1.5 border-t border-[#e5e7eb] dark:border-[#27272a] px-3 py-4 flex flex-col">
        <button onClick={handleSignout} className={`group relative flex h-10 w-full items-center rounded-lg transition-colors px-3 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium ${!isExpanded && 'justify-center'}`}>
          <TbLogout2 className="h-4 w-4 shrink-0" />
          <span className={`ml-3 text-sm whitespace-nowrap transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
            Logout
          </span>
          {!isExpanded && (
            <div className="absolute left-14 hidden whitespace-nowrap rounded-md bg-[#020617] px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:block group-hover:opacity-100 z-50 dark:bg-white dark:text-[#020617]">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}

export default CashierSidebar
