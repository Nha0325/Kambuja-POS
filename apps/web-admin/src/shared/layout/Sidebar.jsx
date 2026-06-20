import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";

const adminLinks = [
  ["/admin/dashboard", "Dashboard"], ["/admin/shop", "Shop"], ["/admin/products", "Products"],
  ["/admin/products/create", "Add product"], ["/admin/categories", "Categories"], ["/admin/inventory", "Inventory"],
  ["/admin/stock-movements", "Stock movements"], ["/admin/cashiers", "Cashiers"], ["/admin/cashiers/create", "Create cashier"],
  ["/admin/reports/sales", "Sales report"], ["/admin/customers", "Customers"], ["/admin/notifications", "Notifications"], ["/admin/settings", "Settings"],
];
const cashierLinks = [["/pos/sale", "POS sale"], ["/pos/payment", "Payment"], ["/pos/receipt", "Receipt"], ["/pos/today-sales", "Today sales"]];

export default function Sidebar() {
  const role = useAuthStore((state) => state.user?.roleName);
  const links = role === "ADMIN" ? adminLinks : cashierLinks;
  return <aside className="w-64 shrink-0 bg-slate-950 p-5 text-white"><p className="mb-8 text-lg font-bold">Kambuja POS</p><nav className="grid gap-1">{links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-emerald-600" : "text-slate-300 hover:bg-slate-800"}`}>{label}</NavLink>)}</nav></aside>;
}
