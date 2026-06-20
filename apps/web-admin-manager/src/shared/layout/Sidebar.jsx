import { NavLink } from "react-router-dom";

const links = [
  ["/dashboard", "Dashboard"],
  ["/admins", "Admins"],
  ["/admins/create", "Create admin"],
  ["/shops", "Shops"],
  ["/location/provinces", "Locations"],
  ["/reports/sales", "Sales report"],
  ["/reports/stock", "Stock report"],
  ["/notifications", "Notifications"],
  ["/settings", "System settings"],
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-slate-950 p-5 text-white">
      <p className="mb-8 text-lg font-bold">Kambuja POS</p>
      <nav className="grid gap-1">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-indigo-600" : "text-slate-300 hover:bg-slate-800"}`}>{label}</NavLink>
        ))}
      </nav>
    </aside>
  );
}
