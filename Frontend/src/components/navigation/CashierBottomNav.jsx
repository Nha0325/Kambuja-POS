import { NavLink } from "react-router-dom"
import { FaCashRegister, FaClockRotateLeft, FaBoxesStacked, FaLock } from "react-icons/fa6"

import { useTranslation } from "react-i18next";

const bottomItems = [
  { to: "/cashier/pos", labelKey: "pos", icon: FaCashRegister },
  { to: "/cashier/sales-history", labelKey: "history", icon: FaClockRotateLeft },
  { to: "/cashier/stock-check", labelKey: "stock", icon: FaBoxesStacked },
  { to: "/cashier/my-shift", labelKey: "shift", icon: FaLock },
]

function CashierBottomNav() {
  const { t } = useTranslation();
  const navLinkClass = ({ isActive }) => (
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-[#06b6d4] dark:text-[#a78bfa]" : "text-[#64748b] dark:text-[#a1a1aa] hover:text-[#020617] dark:hover:text-[#f8fafc]"}`
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 bg-white dark:bg-[#09090b] border-t border-[#e5e7eb] dark:border-[#27272a] lg:hidden px-2 pb-[env(safe-area-inset-bottom)] print:hidden">
      {bottomItems.map(({ to, labelKey, icon: Icon }) => (
        <NavLink key={to} to={to} className={navLinkClass}>
          {({ isActive }) => (
            <>
              <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-semibold transition-all ${isActive ? "opacity-100" : "opacity-80"}`}>{t(labelKey)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default CashierBottomNav
