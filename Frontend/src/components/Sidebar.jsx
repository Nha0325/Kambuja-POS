import { NavLink, useLocation } from "react-router";
import { AiFillHome } from "react-icons/ai";
import { TbActivityHeartbeat } from "react-icons/tb";
import { GoChevronDown } from "react-icons/go";
import { FaHandshake, FaUsers } from "react-icons/fa6";
import { MdCategory, MdInventory2, MdNotifications, MdSettings } from "react-icons/md";
import { PiPackageFill } from "react-icons/pi";
import { IoBagHandle } from "react-icons/io5";
import { FaUserGear } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";

import { useState } from "react";

const primaryItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: AiFillHome },
  { to: "/admin/suppliers", label: "Suppliers", icon: FaHandshake },
  { to: "/admin/categories", label: "Categories", icon: MdCategory },
  { to: "/admin/customers", label: "Customers", icon: FaUsers },
  { to: "/admin/products", label: "Products", icon: PiPackageFill },
]

const operationItems = [
  { to: "/admin/purchases", label: "Purchases", icon: IoBagHandle },
  { to: "/admin/sales", label: "Sales", icon: TbActivityHeartbeat },
  { to: "/admin/cashiers", label: "Cashiers", icon: FaUserGear },
]

const inventoryItems = [
  { to: "/admin/inventory", label: "Stock Overview", icon: MdInventory2, end: true },
  { to: "/admin/inventory/stock-in", label: "Stock In", icon: MdInventory2 },
  { to: "/admin/inventory/adjust", label: "Adjustment", icon: MdInventory2 },
]

const notificationItems = [
  { to: "/admin/notifications/channels", label: "Channels", icon: MdNotifications },
  { to: "/admin/notifications/logs", label: "Logs", icon: MdNotifications },
]

const reportItems = [
  { to: "/admin/reports/sales", label: "Sale Report", icon: IoStatsChart },
  { to: "/admin/reports/stock", label: "Stock Report", icon: TbActivityHeartbeat },
]

const footerItems = [
  { to: "/admin/shop-settings", label: "Shop Settings", icon: MdSettings },
]

const navLinkClass = ({ isActive }) =>
  `${
    isActive
      ? "bg-[#0b1c30] text-white shadow-sm shadow-slate-200"
      : "text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0058be]"
  } flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all`

const subNavLinkClass = ({ isActive }) =>
  `${
    isActive
      ? "border-[#0058be] bg-[#eff4ff] text-[#0058be]"
      : "border-transparent text-[#5b6472] hover:border-[#d7dced] hover:bg-[#f8f9ff] hover:text-[#0058be]"
  } flex min-h-10 w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm font-semibold transition-all`

const groupButtonClass = (isActive) =>
  `${
    isActive
      ? "bg-[#0b1c30] text-white shadow-sm shadow-slate-200"
      : "text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0058be]"
  } flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all`

function Section({ label, children }) {
  return (
    <div className="space-y-1.5">
      <p className="px-3 text-[11px] font-bold uppercase text-[#76777d]">{label}</p>
      {children}
    </div>
  )
}

function NavItems({ items, onNavigate }) {
  return items.map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} className={navLinkClass} onClick={onNavigate}>
      <Icon className="shrink-0 text-base" />
      <span className="min-w-0 truncate">{label}</span>
    </NavLink>
  ))
}

function CollapsibleGroup({ id, label, icon: Icon, items, isActive, isOpen, onToggle, onNavigate }) {
  return (
    <div className="space-y-1.5">
      <button type="button" onClick={() => onToggle(id)} className={groupButtonClass(isActive)}>
        <span className="flex min-w-0 items-center gap-3">
          <Icon className="shrink-0 text-base" />
          <span className="min-w-0 truncate">{label}</span>
        </span>
        <GoChevronDown className={`${isOpen ? "rotate-180" : ""} shrink-0 transition-transform duration-200`} />
      </button>

      {isOpen && (
        <ul className="space-y-1 border-l border-[#d7dced] pl-3">
          {items.map(({ to, label: itemLabel, icon: ItemIcon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={subNavLinkClass} onClick={onNavigate}>
                <ItemIcon className="shrink-0 text-base" />
                <span className="min-w-0 truncate">{itemLabel}</span>
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
    inventory: false,
    notifications: false,
    reports: false,
  });
  const { pathname } = useLocation();

  const isInventoryRoute = pathname.startsWith("/admin/inventory")
  const isNotificationRoute = pathname.startsWith("/admin/notifications")
  const isReportRoute = pathname.startsWith("/admin/reports") || pathname.startsWith("/report")

  const toggleGroup = (id) => {
    setOpenGroups((value) => ({ ...value, [id]: !value[id] }))
  }

  return (
    <aside
      className={`${
        isShowSidebar ? "translate-x-0" : "-translate-x-full"
      } fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col overflow-hidden border-r border-[#d7dced] bg-white shadow-sm transition-transform duration-300`}
    >
      <div className="border-b border-[#e5eeff] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0b1c30] text-sm font-bold text-white">
            KP
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold leading-tight text-[#0b1c30]">Kambuja</h1>
            <p className="mt-0.5 text-[11px] font-bold uppercase text-[#0058be]">Shop Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <Section label="Main">
          <NavItems items={primaryItems} onNavigate={onNavigate} />
        </Section>

        <Section label="Operations">
          <CollapsibleGroup
            id="inventory"
            label="Inventory"
            icon={MdInventory2}
            items={inventoryItems}
            isActive={isInventoryRoute}
            isOpen={openGroups.inventory || isInventoryRoute}
            onToggle={toggleGroup}
            onNavigate={onNavigate}
          />
          <NavItems items={operationItems} onNavigate={onNavigate} />
        </Section>

        <Section label="Monitoring">
          <CollapsibleGroup
            id="notifications"
            label="Notifications"
            icon={MdNotifications}
            items={notificationItems}
            isActive={isNotificationRoute}
            isOpen={openGroups.notifications || isNotificationRoute}
            onToggle={toggleGroup}
            onNavigate={onNavigate}
          />
          <CollapsibleGroup
            id="reports"
            label="Reports"
            icon={IoStatsChart}
            items={reportItems}
            isActive={isReportRoute}
            isOpen={openGroups.reports || isReportRoute}
            onToggle={toggleGroup}
            onNavigate={onNavigate}
          />
        </Section>
      </nav>
      
      <nav className="border-t border-[#e5eeff] px-4 py-4">
        <NavItems items={footerItems} onNavigate={onNavigate} />
      </nav>
    </aside>
  );
}

export default Sidebar;
