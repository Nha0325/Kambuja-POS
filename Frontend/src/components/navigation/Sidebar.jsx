import { useState } from "react"
import { NavLink, useLocation } from "react-router"
import { GoChevronDown } from "react-icons/go"
import {
  LuBadgeDollarSign,
  LuBoxes,
  LuLayoutDashboard,
  LuPackage,
  LuPackagePlus,
  LuReceiptText,
  LuSettings,
  LuSlidersHorizontal,
  LuTags,
  LuTruck,
  LuUsers,
  LuFileText,
  LuContact,
} from "react-icons/lu"

const mainItems1 = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { to: "/admin/products", label: "Products", icon: LuPackage },
  { to: "/admin/categories", label: "Categories", icon: LuTags },
]

const inventoryItems = [
  { to: "/admin/inventory", label: "Stock Overview", icon: LuLayoutDashboard, end: true },
  { to: "/admin/inventory/stock-in", label: "Stock In", icon: LuPackagePlus },
  { to: "/admin/inventory/adjustment", label: "Adjustment", icon: LuSlidersHorizontal },
]

const mainItems2 = [
  { to: "/admin/purchases", label: "Purchases", icon: LuReceiptText },
  { to: "/admin/suppliers", label: "Suppliers", icon: LuTruck },
  { to: "/admin/customers", label: "Customers", icon: LuContact },
  { to: "/admin/cashiers", label: "Cashiers", icon: LuUsers },
]

const reportItems = [
  { to: "/admin/reports/sales", label: "Sales Report", icon: LuBadgeDollarSign },
  { to: "/admin/reports/stock", label: "Stock Report", icon: LuBoxes },
]

const footerItems = [
  { to: "/admin/settings", label: "Settings", icon: LuSettings },
]

const navLinkClass = ({ isActive }) =>
  `${isActive
    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-[#3350BF] dark:to-[#AF68E0] text-white shadow-md shadow-violet-200 dark:shadow-[#3350BF]/20"
    : "text-slate-600 dark:text-[#A9A6BB] hover:bg-slate-50 dark:hover:bg-[#22262D] hover:text-slate-900 dark:hover:text-white"
  } flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all`

const subNavLinkClass = ({ isActive }) =>
  `${isActive
    ? "text-violet-700 dark:text-white font-medium"
    : "text-slate-600 dark:text-[#A9A6BB] hover:text-slate-900 dark:hover:text-white"
  } flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all relative`

const groupButtonClass = (isActive) =>
  `${isActive
    ? "bg-slate-100 text-slate-900 dark:bg-[#22262D] dark:text-white"
    : "text-slate-600 dark:text-[#A9A6BB] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-[#22262D] dark:hover:text-white"
  } flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all`

function NavItems({ items, onNavigate }) {
  return items.map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} className={navLinkClass} onClick={onNavigate}>
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
    </NavLink>
  ))
}

function CollapsibleGroup({ id, label, icon: Icon, items, isActive, isOpen, onToggle, onNavigate }) {
  return (
    <div className="space-y-1.5">
      <button type="button" onClick={() => onToggle(id)} className={groupButtonClass(isActive)}>
        <span className="flex min-w-0 items-center gap-3">
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="min-w-0 truncate">{label}</span>
        </span>
        <GoChevronDown className={`${isOpen ? "rotate-180" : ""} h-4 w-4 shrink-0 transition-transform duration-200`} />
      </button>

      {isOpen && (
        <ul className="space-y-1 mt-1 pl-11 relative before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-[#22262D]">
          {items.map(({ to, label: itemLabel, icon: ItemIcon, end }) => (
            <li key={to} className="relative">
              <NavLink to={to} end={end} className={subNavLinkClass} onClick={onNavigate}>
                {({ isActive }) => (
                  <>
                    <span className={`absolute left-[-23px] top-1/2 h-[1px] w-3 -translate-y-1/2 ${isActive ? 'bg-violet-500 dark:bg-[#3350BF]' : 'bg-slate-200 dark:bg-[#22262D]'}`}></span>
                    <ItemIcon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-violet-600 dark:text-[#AF68E0]' : ''}`} />
                    <span className="min-w-0 truncate">{itemLabel}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Sidebar({ isShowSidebar, onNavigate }) {
  const [openGroups, setOpenGroups] = useState({
    inventory: true,
    reports: true,
  })
  const { pathname } = useLocation()

  const isInventoryRoute = pathname.startsWith("/admin/inventory")
  const isReportsRoute = pathname.startsWith("/admin/reports")

  const toggleGroup = (id) => {
    setOpenGroups((value) => ({ ...value, [id]: !value[id] }))
  }

  return (
    <aside
      className={`${isShowSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 flex h-screen w-[292px] flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-700 dark:border-[#2A2E36] dark:bg-[#0A0B0D] dark:text-slate-300 transition-transform duration-300`}
    >
      <div className="shrink-0 border-b border-slate-200 dark:border-[#2A2E36] px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">Kambuja</h1>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Shop POS Admin</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 space-y-2 overflow-y-auto px-4 py-5">
        <NavItems items={mainItems1} onNavigate={onNavigate} />

        <CollapsibleGroup
          id="inventory"
          label="Inventory"
          icon={LuBoxes}
          items={inventoryItems}
          isActive={isInventoryRoute}
          isOpen={openGroups.inventory || isInventoryRoute}
          onToggle={toggleGroup}
          onNavigate={onNavigate}
        />

        <NavItems items={mainItems2} onNavigate={onNavigate} />

        <CollapsibleGroup
          id="reports"
          label="Reports"
          icon={LuFileText}
          items={reportItems}
          isActive={isReportsRoute}
          isOpen={openGroups.reports || isReportsRoute}
          onToggle={toggleGroup}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="shrink-0 border-t border-slate-200 dark:border-[#2A2E36] px-4 py-4">
        <NavItems items={footerItems} onNavigate={onNavigate} />
      </div>
    </aside>
  )
}

export default Sidebar
