import { NavLink } from "react-router-dom"
import { FaCashRegister, FaClockRotateLeft, FaFileInvoice } from "react-icons/fa6"

const items = [
  { to: "/cashier/pos", label: "POS", icon: FaCashRegister },
  { to: "/cashier/today-sales", label: "Sales History", icon: FaClockRotateLeft },
  { to: "/cashier/today-sales", label: "Invoice", icon: FaFileInvoice },
]

function CashierSidebar({ isShowSidebar = true, onNavigate }) {
  return (
    <aside className={`${isShowSidebar ? "translate-x-0" : "-translate-x-full"} fixed left-0 top-0 z-50 min-h-screen w-44 border-r border-gray-900 bg-white transition-transform duration-300`}>
      <div className="flex h-[56px] items-center justify-center text-base font-bold">Master POS</div>
      <nav className="space-y-2 px-2 py-4">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={`${to}-${label}`}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `${isActive ? "bg-black text-white" : "text-black hover:bg-gray-100"} flex items-center gap-2 rounded-md px-3 py-3 text-sm`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default CashierSidebar
