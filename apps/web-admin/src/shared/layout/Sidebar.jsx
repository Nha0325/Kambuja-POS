import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import { useI18nStore } from "../../app/i18nStore";

export default function Sidebar() {
  const role = useAuthStore((state) => state.user?.roleName);
  const { t } = useI18nStore();

  const adminLinks = [
    ["/admin/dashboard", t("nav.dashboard", "Dashboard")], 
    ["/admin/shop", t("nav.shops", "Shop")], 
    ["/admin/products", t("nav.products", "Products")],
    ["/admin/products/create", t("product.add", "Add product")], 
    ["/admin/categories", t("nav.categories", "Categories")], 
    ["/admin/inventory", t("nav.inventory", "Inventory")],
    ["/admin/stock-movements", t("nav.stock-movements", "Stock movements")], 
    ["/admin/cashiers", t("nav.cashiers", "Cashiers")], 
    ["/admin/cashiers/create", t("common.add", "Create") + " " + t("user.role.cashier", "cashier")],
    ["/admin/reports/sales", t("nav.sales-report", "Sales report")], 
    ["/admin/customers", t("nav.customers", "Customers")], 
    ["/admin/notifications", t("nav.notifications", "Notifications")], 
    ["/admin/settings", t("nav.settings", "Settings")],
  ];
  const cashierLinks = [
    ["/pos/sale", t("pos.sale", "POS sale")], 
    ["/pos/payment", t("pos.payment-method", "Payment")], 
    ["/pos/receipt", t("pos.receipt", "Receipt")], 
    ["/pos/today-sales", t("pos.today-sales", "Today sales")]
  ];

  const links = role === "ADMIN" ? adminLinks : cashierLinks;
  
  return (
    <aside className="w-64 shrink-0 bg-slate-950 p-5 text-white">
      <p className="mb-8 text-lg font-bold">Kambuja POS</p>
      <nav className="grid gap-1">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-emerald-600" : "text-slate-300 hover:bg-slate-800"}`}>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
