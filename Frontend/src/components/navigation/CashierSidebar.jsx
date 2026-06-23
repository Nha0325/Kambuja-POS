import { NavLink, useNavigate } from "react-router-dom"
import {
  FaCashRegister,
  FaClockRotateLeft,
  FaBoxesStacked,
  FaClipboardList,
  FaLock
} from "react-icons/fa6";
import { TbLogout2 } from "react-icons/tb";
import useSignout from "../../hooks/auth/useSignout";

const items = [
  { to: "/cashier/pos", label: "POS", icon: FaCashRegister },
  { to: "/cashier/hold-bills", label: "Hold Bill", icon: FaClipboardList },
  { to: "/cashier/sales-today", label: "Sales Today", icon: FaClockRotateLeft },
  { to: "/cashier/stock-check", label: "Stock Check", icon: FaBoxesStacked },
  { to: "/cashier/daily-close", label: "Daily Close", icon: FaLock },
];

const navLinkClass = ({ isActive }) =>
  `${
    isActive
      ? "bg-[#0b1c30] text-white shadow-sm shadow-slate-200"
      : "text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0058be]"
  } flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all`

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

function CashierSidebar({ isShowSidebar = true, onNavigate }) {
  const { signout } = useSignout()
  const navigate = useNavigate()

  const handleSignout = async () => {
    const res = await signout()
    if (res) navigate('/login')
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
            <p className="mt-0.5 text-[11px] font-bold uppercase text-[#0058be]">Cashier System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <Section label="Main">
          <NavItems items={items} onNavigate={onNavigate} />
        </Section>
      </nav>

      <nav className="border-t border-[#e5eeff] px-4 py-4">
        <button onClick={handleSignout} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all">
          <TbLogout2 className="shrink-0 text-base" />
          <span className="min-w-0 truncate">Logout</span>
        </button>
      </nav>
    </aside>
  )
}

export default CashierSidebar
